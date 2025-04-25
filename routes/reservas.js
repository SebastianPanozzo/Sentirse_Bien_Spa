const express = require('express');
const router = express.Router();
const reservasController = require('../controllers/reservasController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

// 📌 Crear una nueva reserva (solo usuarios logueados)
router.post('/', verificarToken, reservasController.crearReserva);

// 📌 Obtener todas las reservas (solo administradores)
router.get('/', verificarToken, soloAdmin, reservasController.obtenerReservas);

// 📌 Verificar disponibilidad de horarios (usuarios logueados)
router.get('/disponibilidad', verificarToken, reservasController.verificarDisponibilidad);

// 📌 Actualizar una reserva por ID (solo administradores)
router.put('/:id', verificarToken, soloAdmin, reservasController.actualizarReserva);

// 📌 Eliminar una reserva por ID (solo administradores)
router.delete('/:id', verificarToken, soloAdmin, reservasController.eliminarReserva);

module.exports = router;