const express = require('express');
const router = express.Router();
const comentariosController = require('../controllers/comentariosController');
const { verificarToken } = require('../middlewares/authMiddleware');

// 🟢 Cualquiera puede ver los comentarios
router.get('/', comentariosController.obtenerComentarios);

// 🔒 Solo usuarios logueados pueden comentar
router.post('/', verificarToken, comentariosController.crearComentario);

// 🔒 Solo usuarios logueados pueden eliminar comentarios
router.delete('/:id', verificarToken, comentariosController.eliminarComentario);

module.exports = router;
