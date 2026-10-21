function requireAuth(req, res, next) {
  if (!req.session.userEmail) {
    return res.redirect('/login');
  }
  next();
}

module.exports = requireAuth;
