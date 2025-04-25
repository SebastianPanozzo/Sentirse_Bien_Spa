const express = require('express');
const router = express.Router();
const contactoController = require('../controllers/contactoController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

// Ruta pública para enviar mensajes de contacto
router.post('/', contactoController.crearMensaje);

// Rutas protegidas para administradores
router.get('/', verificarToken, soloAdmin, contactoController.obtenerMensajes);
router.delete('/:id', verificarToken, soloAdmin, contactoController.eliminarMensaje);

module.exports = router;