// controllers/reservasController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SERVICIOS_GRUPALES = ['Clase de Yoga', 'Taller de Meditación', 'Pilates Grupal'];

exports.obtenerReservas = async (req, res) => {
  try {
    const where = {};
    if (req.query.estado) where.estado = req.query.estado;

    if (req.query.fecha) {
      const fecha = new Date(req.query.fecha);
      const siguiente = new Date(fecha);
      siguiente.setDate(fecha.getDate() + 1);
      where.fecha = {
        gte: fecha,
        lt: siguiente
      };
    }

    const reservas = await prisma.reserva.findMany({
      where,
      include: { cliente: true }
    });
    res.json(reservas);
  } catch (err) {
    console.error("❌ Error al obtener reservas:", err);
    res.status(500).json({ mensaje: 'Error al obtener reservas' });
  }
};

exports.crearReserva = async (req, res) => {
  const { cliente: clienteId, servicio, fecha, hora } = req.body;

  if (!clienteId || !servicio || !fecha || !hora) {
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
  }

  if (isNaN(parseInt(clienteId))) {
    return res.status(400).json({ mensaje: 'ID de cliente inválido' });
  }

  try {
    const fechaObj = new Date(fecha);
    const ahora = new Date();
    const inicioProximaSemana = new Date();
    inicioProximaSemana.setDate(ahora.getDate() + (7 - ahora.getDay()));
    inicioProximaSemana.setHours(0, 0, 0, 0);

    if (fechaObj < inicioProximaSemana) {
      return res.status(400).json({ mensaje: 'Solo se permiten reservas a partir de la próxima semana' });
    }

    const [horaInt, minutosInt] = hora.split(':').map(Number);
    if (horaInt < 12 || horaInt >= 22) {
      return res.status(400).json({ mensaje: 'El horario de servicio es de 12:00 a 22:00' });
    }

    const esGrupal = SERVICIOS_GRUPALES.includes(servicio);

    if (!esGrupal) {
      const reservaExistente = await prisma.reserva.findFirst({
        where: { fecha: fechaObj, hora, esGrupal: false }
      });
      if (reservaExistente) {
        return res.status(400).json({ mensaje: 'Este horario ya está reservado para otro servicio' });
      }

      const horaAnterior = `${horaInt - 1}:${minutosInt < 10 ? '0' + minutosInt : minutosInt}`;
      const horaPosterior = `${horaInt + 1}:${minutosInt < 10 ? '0' + minutosInt : minutosInt}`;

      const reservasAdyacentes = await prisma.reserva.findMany({
        where: {
          servicio,
          fecha: fechaObj,
          hora: { in: [horaAnterior, horaPosterior] }
        }
      });
      if (reservasAdyacentes.length > 0) {
        return res.status(400).json({ mensaje: 'Ya existe una reserva para este servicio en un horario adyacente' });
      }
    }

    const reservasDelDia = await prisma.reserva.findMany({ where: { fecha: fechaObj } });
    const reservasPorHora = {};
    reservasDelDia.forEach(r => {
      if (!reservasPorHora[r.hora]) reservasPorHora[r.hora] = 0;
      reservasPorHora[r.hora]++;
    });

    if (Object.keys(reservasPorHora).length >= 10 && Object.values(reservasPorHora).every(count => count > 0)) {
      return res.status(400).json({ mensaje: 'No hay horarios disponibles para este día' });
    }

    const nuevaReserva = await prisma.reserva.create({
      data: {
        clienteId: parseInt(clienteId),
        servicio,
        fecha: fechaObj,
        hora,
        esGrupal
      }
    });

    res.status(201).json({ mensaje: 'Reserva creada con éxito', reserva: nuevaReserva });
  } catch (err) {
    console.error("❌ Error al crear la reserva:", err);
    res.status(500).json({ mensaje: 'Error al crear la reserva' });
  }
};

exports.actualizarReserva = async (req, res) => {
  try {
    const reserva = await prisma.reserva.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    res.json(reserva);
  } catch (err) {
    console.error("❌ Error al actualizar la reserva:", err);
    res.status(500).json({ mensaje: 'Error al actualizar la reserva' });
  }
};

exports.eliminarReserva = async (req, res) => {
  try {
    await prisma.reserva.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ mensaje: 'Reserva eliminada con éxito' });
  } catch (err) {
    console.error("❌ Error al eliminar la reserva:", err);
    res.status(500).json({ mensaje: 'Error al eliminar la reserva' });
  }
};

exports.verificarDisponibilidad = async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) {
      return res.status(400).json({ mensaje: 'La fecha es obligatoria' });
    }

    const fechaObj = new Date(fecha);
    const reservasDelDia = await prisma.reserva.findMany({ where: { fecha: fechaObj } });

    const horasServicio = Array.from({ length: 10 }, (_, i) => `${i + 12}:00`);
    const disponibilidad = {};

    horasServicio.forEach(hora => {
      const reservasEnHora = reservasDelDia.filter(r => r.hora === hora);
      const reservaNoGrupal = reservasEnHora.find(r => !r.esGrupal);
      disponibilidad[hora] = !reservaNoGrupal;
    });

    res.json({ disponibilidad });
  } catch (err) {
    console.error("❌ Error al verificar disponibilidad:", err);
    res.status(500).json({ mensaje: 'Error al verificar disponibilidad' });
  }
};
