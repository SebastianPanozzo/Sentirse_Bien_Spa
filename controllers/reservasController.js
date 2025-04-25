// controllers/reservasController.js
const mongoose = require('mongoose');
const Reserva = require('../models/Reserva');

// Servicios grupales (estos pueden tener múltiples reservas en el mismo horario)
const SERVICIOS_GRUPALES = ['Clase de Yoga', 'Taller de Meditación', 'Pilates Grupal'];

// GET: Obtener reservas (con filtro opcional por fecha y estado)
exports.obtenerReservas = async (req, res) => {
  try {
    const filtro = {};
    if (req.query.estado) filtro.estado = req.query.estado;

    if (req.query.fecha) {
      const fecha = new Date(req.query.fecha);
      const siguiente = new Date(fecha);
      siguiente.setDate(fecha.getDate() + 1);
      filtro.fecha = { $gte: fecha, $lt: siguiente };
    }

    const reservas = await Reserva.find(filtro).populate('cliente');
    res.json(reservas);
  } catch (err) {
    console.error("❌ Error al obtener reservas:", err);
    res.status(500).json({ mensaje: 'Error al obtener reservas' });
  }
};

// POST: Crear una reserva con validaciones
exports.crearReserva = async (req, res) => {
  const { cliente, servicio, fecha, hora } = req.body;

  if (!cliente || !servicio || !fecha || !hora) {
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
  }

  // Validar que el ID de cliente sea válido
  if (!mongoose.Types.ObjectId.isValid(cliente)) {
    return res.status(400).json({ mensaje: 'ID de cliente inválido' });
  }

  try {
    const fechaObj = new Date(fecha);
    const ahora = new Date();
    
    // Validar que la fecha sea de la próxima semana en adelante
    const inicioProximaSemana = new Date();
    inicioProximaSemana.setDate(ahora.getDate() + (7 - ahora.getDay()));
    inicioProximaSemana.setHours(0, 0, 0, 0);
    
    if (fechaObj < inicioProximaSemana) {
      return res.status(400).json({ 
        mensaje: 'Solo se permiten reservas a partir de la próxima semana' 
      });
    }
    
    // Validar que la hora esté dentro del horario de servicio (12:00 - 22:00)
    const [horaInt, minutosInt] = hora.split(':').map(Number);
    if (horaInt < 12 || horaInt >= 22) {
      return res.status(400).json({ 
        mensaje: 'El horario de servicio es de 12:00 a 22:00' 
      });
    }
    
    // Verificar si el servicio es grupal
    const esGrupal = SERVICIOS_GRUPALES.includes(servicio);
    
    // Si NO es grupal, verificar que no haya otra reserva en ese horario
    if (!esGrupal) {
      const reservaExistente = await Reserva.findOne({ 
        fecha: fechaObj, 
        hora, 
        esGrupal: false 
      });
      
      if (reservaExistente) {
        return res.status(400).json({ 
          mensaje: 'Este horario ya está reservado para otro servicio' 
        });
      }
      
      // Verificar que no haya reservas 1 hora antes o después para el mismo servicio
      const horaAnterior = `${horaInt - 1}:${minutosInt < 10 ? '0' + minutosInt : minutosInt}`;
      const horaPosterior = `${horaInt + 1}:${minutosInt < 10 ? '0' + minutosInt : minutosInt}`;
      
      const reservasAdyacentes = await Reserva.find({
        servicio,
        fecha: fechaObj,
        hora: { $in: [horaAnterior, horaPosterior] }
      });
      
      if (reservasAdyacentes.length > 0) {
        return res.status(400).json({ 
          mensaje: 'Ya existe una reserva para este servicio en un horario adyacente' 
        });
      }
    }
    
    // Verificar disponibilidad total del día
    const reservasDelDia = await Reserva.find({ fecha: fechaObj });
    // Agrupar por hora para verificar cuántas reservas hay en cada hora
    const reservasPorHora = {};
    reservasDelDia.forEach(r => {
      if (!reservasPorHora[r.hora]) reservasPorHora[r.hora] = 0;
      reservasPorHora[r.hora]++;
    });
    
    // Si todas las horas disponibles tienen reservas (10 horas de servicio)
    if (Object.keys(reservasPorHora).length >= 10 && 
        Object.values(reservasPorHora).every(count => count > 0)) {
      return res.status(400).json({ 
        mensaje: 'No hay horarios disponibles para este día' 
      });
    }

    const nuevaReserva = new Reserva({ 
      cliente, 
      servicio, 
      fecha: fechaObj, 
      hora,
      esGrupal
    });
    
    await nuevaReserva.save();
    
    res.status(201).json({ 
      mensaje: 'Reserva creada con éxito', 
      reserva: nuevaReserva 
    });
  } catch (err) {
    console.error("❌ Error al crear la reserva:", err);
    res.status(500).json({ mensaje: 'Error al crear la reserva' });
  }
};

// PUT: Actualizar una reserva
exports.actualizarReserva = async (req, res) => {
  try {
    const reserva = await Reserva.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!reserva) return res.status(404).json({ mensaje: 'Reserva no encontrada' });
    res.json(reserva);
  } catch (err) {
    console.error("❌ Error al actualizar la reserva:", err);
    res.status(500).json({ mensaje: 'Error al actualizar la reserva' });
  }
};

// DELETE: Eliminar una reserva
exports.eliminarReserva = async (req, res) => {
  try {
    const reserva = await Reserva.findByIdAndDelete(req.params.id);
    if (!reserva) return res.status(404).json({ mensaje: 'Reserva no encontrada' });
    res.json({ mensaje: 'Reserva eliminada con éxito' });
  } catch (err) {
    console.error("❌ Error al eliminar la reserva:", err);
    res.status(500).json({ mensaje: 'Error al eliminar la reserva' });
  }
};

// Nuevo endpoint para verificar disponibilidad
exports.verificarDisponibilidad = async (req, res) => {
  try {
    const { fecha } = req.query;
    
    if (!fecha) {
      return res.status(400).json({ mensaje: 'La fecha es obligatoria' });
    }
    
    const fechaObj = new Date(fecha);
    const reservasDelDia = await Reserva.find({ fecha: fechaObj });
    
    // Crear array con todas las horas de servicio (12:00 a 22:00)
    const horasServicio = Array.from({ length: 10 }, (_, i) => `${i + 12}:00`);
    
    // Marcar qué horas están disponibles
    const disponibilidad = {};
    horasServicio.forEach(hora => {
      const reservasEnHora = reservasDelDia.filter(r => r.hora === hora);
      // Si hay reservas no grupales en esta hora, no está disponible
      const reservaNoGrupal = reservasEnHora.find(r => !r.esGrupal);
      disponibilidad[hora] = !reservaNoGrupal;
    });
    
    res.json({ disponibilidad });
  } catch (err) {
    console.error("❌ Error al verificar disponibilidad:", err);
    res.status(500).json({ mensaje: 'Error al verificar disponibilidad' });
  }
};