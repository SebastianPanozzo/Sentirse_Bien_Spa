// controllers/contactoController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear un nuevo mensaje de contacto
exports.crearMensaje = async (req, res) => {
  try {
    const { nombre, email, telefono, mensaje } = req.body;

    const nuevoMensaje = await prisma.contacto.create({
      data: {
        nombre,
        email,
        asunto: "Consulta desde formulario de contacto", // Valor predeterminado para el campo asunto
        mensaje,
        // telefono no está en el modelo de Prisma, así que no lo incluimos
      }
    });
    
    res.status(201).json({ mensaje: 'Mensaje enviado correctamente' });
  } catch (error) {
    console.error('Error al guardar el mensaje de contacto:', error);
    res.status(500).json({ mensaje: 'Error al enviar el mensaje' });
  }
};

// Resto de funciones sin cambios
exports.obtenerMensajes = async (req, res) => {
  try {
    // Verificar si el usuario es admin (debería validarse en el middleware)
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'Acceso denegado: solo administradores pueden ver mensajes de contacto.' });
    }
    
    const mensajes = await prisma.contacto.findMany({
      orderBy: {
        fecha: 'desc'
      }
    });
    
    res.json(mensajes);
  } catch (error) {
    console.error('Error al obtener mensajes de contacto:', error);
    res.status(500).json({ mensaje: 'Error al obtener mensajes' });
  }
};

exports.eliminarMensaje = async (req, res) => {
  try {
    const mensajeId = parseInt(req.params.id);

    // Verificación de rol (solo admins pueden eliminar)
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'Acceso denegado: solo administradores pueden eliminar mensajes.' });
    }

    const mensajeEliminado = await prisma.contacto.delete({
      where: { id: mensajeId }
    });

    if (!mensajeEliminado) {
      return res.status(404).json({ mensaje: 'Mensaje no encontrado' });
    }

    res.status(200).json({ mensaje: 'Mensaje eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el mensaje:', error);
    res.status(500).json({ mensaje: 'Error al eliminar el mensaje', error });
  }
};