const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

// Rutas protegidas para administrador
router.get('/', verificarToken, soloAdmin, clientesController.obtenerClientes);
router.put('/:id', verificarToken, soloAdmin, clientesController.actualizarCliente);
router.delete('/:id', verificarToken, soloAdmin, clientesController.eliminarCliente);

// Rutas públicas
router.post('/', clientesController.crearCliente); // Registro
router.post('/login', clientesController.loginCliente); // Login

module.exports = router;
