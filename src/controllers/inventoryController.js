const db = require('../config/db');
const STOCK_ALERT_THRESHOLD = 5;

function isValidId(id) {
  return /^[\w-]{1,50}$/.test(id);
}

function parseProduct(body) {
  const codeInput = String(body.codigo ?? '').trim();
  const salePriceInput = String(body.precioVenta ?? '').trim();
  const purchasePriceInput = String(body.precioCompra ?? '').trim();
  const stockInput = String(body.stock ?? '').trim();
  const categoryId = String(body.categoriaId ?? '').trim();
  const product = {
    codigo: codeInput,
    nombre: String(body.nombre || '').trim(),
    categoria: '',
    categoriaId: categoryId,
    unidadMedida: String(body.unidadMedida || '').trim(),
    precioVenta: Number(salePriceInput),
    precioCompra: Number(purchasePriceInput),
    stock: Number(stockInput),
  };

  if (!codeInput || codeInput.length > 50) {
    return { error: 'El código es obligatorio (máximo 50 caracteres).', product };
  }
  if (!product.nombre || !categoryId || !product.unidadMedida) {
    return { error: 'Nombre, categoría y unidad de medida son obligatorios.', product };
  }
  if (!salePriceInput || !Number.isFinite(product.precioVenta) || product.precioVenta < 0) {
    return { error: 'El precio de venta debe ser un número igual o mayor que cero.', product };
  }
  if (!purchasePriceInput || !Number.isFinite(product.precioCompra) || product.precioCompra < 0) {
    return { error: 'El precio de compra debe ser un número igual o mayor que cero.', product };
  }
  if (!stockInput || !Number.isInteger(product.stock) || product.stock < 0) {
    return { error: 'El stock debe ser un número entero igual o mayor que cero.', product };
  }

  return { product };
}

function getMetrics(products) {
  return {
    productCount: products.length,
    lowStockCount: products.filter((product) => product.stock <= STOCK_ALERT_THRESHOLD).length,
    inventoryValue: products.reduce(
      (total, product) => total + Number(product.precioCompra) * Number(product.stock),
      0
    ),
  };
}

async function showDashboard(req, res) {
  const [products, categories] = await Promise.all([
    db.getProducts(),
    db.getCategories(),
  ]);
  res.render('inventory/dashboard', {
    products,
    categories,
    metrics: getMetrics(products),
    userEmail: req.session.userEmail,
    message: req.query.mensaje || '',
    error: '',
    formData: {},
  });
}

async function createProduct(req, res) {
  const categories = await db.getCategories();
  const { error, product } = parseProduct(req.body);
  const category = categories.find((item) => String(item.id) === product.categoriaId);

  if (error || !category) {
    const products = await db.getProducts();
    return res.status(400).render('inventory/dashboard', {
      products,
      categories,
      metrics: getMetrics(products),
      userEmail: req.session.userEmail,
      message: '',
      error: error || 'Selecciona una categoría válida.',
      formData: product,
    });
  }

  product.categoria = category.nombre;
  await db.createProduct(product);
  res.redirect('/productos?mensaje=Producto%20agregado');
}

async function showEditForm(req, res) {
  if (!isValidId(req.params.id)) {
    return res.status(400).render('error', {
      title: 'Identificador inválido',
      message: 'El identificador del producto no es válido.',
    });
  }

  const [product, categories] = await Promise.all([
    db.getProduct(req.params.id),
    db.getCategories(),
  ]);

  if (!product) {
    return res.status(404).render('error', {
      title: 'Producto no encontrado',
      message: 'El producto que intentas editar no existe.',
    });
  }

  res.render('inventory/edit', {
    product,
    categories,
    userEmail: req.session.userEmail,
    error: '',
  });
}

async function editProduct(req, res) {
  if (!isValidId(req.params.id)) {
    return res.status(400).render('error', {
      title: 'Identificador inválido',
      message: 'El identificador del producto no es válido.',
    });
  }

  const categories = await db.getCategories();
  const { error, product } = parseProduct(req.body);
  const category = categories.find((item) => String(item.id) === product.categoriaId);

  if (error || !category) {
    return res.status(400).render('inventory/edit', {
      product: { ...product, id: req.params.id },
      categories,
      userEmail: req.session.userEmail,
      error: error || 'Selecciona una categoría válida.',
    });
  }

  product.categoria = category.nombre;
  await db.updateProduct(req.params.id, product);
  res.redirect('/productos?mensaje=Producto%20actualizado');
}

async function removeProduct(req, res) {
  if (!isValidId(req.params.id)) {
    return res.status(400).render('error', {
      title: 'Identificador inválido',
      message: 'El identificador del producto no es válido.',
    });
  }

  await db.deleteProduct(req.params.id);
  res.redirect('/productos?mensaje=Producto%20eliminado');
}

module.exports = {
  createProduct,
  editProduct,
  removeProduct,
  showDashboard,
  showEditForm,
};
