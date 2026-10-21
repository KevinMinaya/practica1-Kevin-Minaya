const db = require('../config/db');

function renderLogin(res, error = '') {
  res.render('login', { error });
}

async function showLogin(req, res) {
  if (req.session.userEmail) {
    return res.redirect('/productos');
  }
  renderLogin(res);
}

async function login(req, res, next) {
  const email = String(req.body.email || '').trim();
  const password = String(req.body.password || '');

  if (!email || !password) {
    return renderLogin(res, 'Escribe tu correo y contraseña.');
  }

  try {
    const user = await db.authenticate(email, password);
    if (!user) {
      return renderLogin(res, 'Correo o contraseña incorrectos.');
    }
    await new Promise((resolve, reject) => {
      req.session.regenerate((error) => (error ? reject(error) : resolve()));
    });
    req.session.userEmail = user.email;
    await new Promise((resolve, reject) => {
      req.session.save((error) => (error ? reject(error) : resolve()));
    });
    res.redirect('/productos');
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    await new Promise((resolve, reject) => {
      req.session.destroy((error) => (error ? reject(error) : resolve()));
    });
    res.clearCookie('ferreteria.sid', {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    res.redirect('/login');
  } catch (error) {
    next(error);
  }
}

module.exports = { login, logout, showLogin };
