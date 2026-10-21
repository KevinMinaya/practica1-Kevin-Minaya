const express = require('express');
const authController = require('../controllers/authController');
const inventoryController = require('../controllers/inventoryController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.get('/', (req, res) => res.redirect('/productos'));
router.get('/login', authController.showLogin);
router.post('/login', authController.login);
router.post('/logout', requireAuth, authController.logout);
router.get('/productos', requireAuth, inventoryController.showDashboard);
router.post('/productos', requireAuth, inventoryController.createProduct);
router.get('/productos/:id/editar', requireAuth, inventoryController.showEditForm);
router.post('/productos/:id/editar', requireAuth, inventoryController.editProduct);
router.post('/productos/:id/eliminar', requireAuth, inventoryController.removeProduct);

module.exports = router;
