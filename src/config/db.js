const crypto = require('crypto');
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ferreteria',
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true,
});

function mapProduct(row) {
  return {
    id: row.id,
    codigo: row.CODIGO,
    nombre: row.NOMBRE,
    stock: row.STOCK,
    precioVenta: row.PRECIO_VENTA,
    precioCompra: row.PRECIO_COMPRA,
    categoria: row.CATEGORIA,
    unidadMedida: row.UNIDAD_MEDIDA,
    categoriaId: row.ID_CATEGORIA,
  };
}

async function getProducts() {
  const [rows] = await pool.query('SELECT * FROM productos ORDER BY NOMBRE ASC');
  return rows.map(mapProduct);
}

async function getProduct(id) {
  const [rows] = await pool.query('SELECT * FROM productos WHERE id = ? LIMIT 1', [id]);
  return rows[0] ? mapProduct(rows[0]) : null;
}

async function getCategories() {
  const [rows] = await pool.query('SELECT id, NOMBRE, DESCRIPCION FROM categoria ORDER BY NOMBRE ASC');
  return rows.map((row) => ({ id: row.id, nombre: row.NOMBRE, descripcion: row.DESCRIPCION }));
}

async function createProduct(product) {
  await pool.query(
    `INSERT INTO productos
      (id, CODIGO, NOMBRE, STOCK, PRECIO_VENTA, PRECIO_COMPRA, CATEGORIA, UNIDAD_MEDIDA, ID_CATEGORIA)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      crypto.randomUUID(),
      product.codigo,
      product.nombre,
      product.stock,
      product.precioVenta,
      product.precioCompra,
      product.categoria,
      product.unidadMedida,
      product.categoriaId,
    ]
  );
}

async function updateProduct(id, product) {
  await pool.query(
    `UPDATE productos SET CODIGO = ?, NOMBRE = ?, STOCK = ?, PRECIO_VENTA = ?, PRECIO_COMPRA = ?,
       CATEGORIA = ?, UNIDAD_MEDIDA = ?, ID_CATEGORIA = ? WHERE id = ?`,
    [
      product.codigo,
      product.nombre,
      product.stock,
      product.precioVenta,
      product.precioCompra,
      product.categoria,
      product.unidadMedida,
      product.categoriaId,
      id,
    ]
  );
}

async function deleteProduct(id) {
  await pool.query('DELETE FROM productos WHERE id = ?', [id]);
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) {
    return false;
  }
  const expected = Buffer.from(hash, 'hex');
  const actual = crypto.scryptSync(password, salt, expected.length);
  return crypto.timingSafeEqual(expected, actual);
}

async function authenticate(email, password) {
  const [rows] = await pool.query('SELECT email, password_hash FROM usuarios WHERE email = ? LIMIT 1', [email]);
  const user = rows[0];
  return user && verifyPassword(password, user.password_hash) ? { email: user.email } : null;
}

async function saveUser(email, password) {
  await pool.query(
    `INSERT INTO usuarios (email, password_hash) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
    [email, hashPassword(password)]
  );
}

module.exports = {
  authenticate,
  createProduct,
  deleteProduct,
  getCategories,
  getProduct,
  getProducts,
  pool,
  saveUser,
  updateProduct,
};
