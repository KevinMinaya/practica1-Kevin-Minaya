require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const inventoryRoutes = require('./src/routes/inventoryRoutes');

const app = express();
const port = Number(process.env.PORT) || 3000;
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error('Falta SESSION_SECRET. Configura las variables indicadas en .env.example.');
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : false);

app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    name: 'ferreteria.sid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 8 * 60 * 60 * 1000,
    },
  })
);

app.use('/', inventoryRoutes);

app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Página no encontrada',
    message: 'No encontramos la página que buscas.',
  });
});

app.use((error, req, res, next) => {
  console.error('Error de la aplicación:', error.message);
  if (res.headersSent) {
    return next(error);
  }

  res.status(error.statusCode || 500).render('error', {
    title: 'No se pudo completar la solicitud',
    message: 'Ocurrió un error. Verifica la conexión y la configuración de Supabase.',
  });
});

app.listen(port, () => {
  console.log(`Ferretería lista en http://localhost:${port}`);
});
