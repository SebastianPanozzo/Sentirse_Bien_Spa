const Contacto = require('../models/Contacto');

// Crear un nuevo mensaje de contacto
exports.crearMensaje = async (req, res) => {
  try {
    const nuevoMensaje = new Contacto(req.body);
    await nuevoMensaje.save();
    res.status(201).json({ mensaje: 'Mensaje enviado correctamente' });
  } catch (error) {
    console.error('Error al guardar el mensaje de contacto:', error);
    res.status(500).json({ mensaje: 'Error al enviar el mensaje' });
  }
};

// Obtener todos los mensajes (solo para administradores)
exports.obtenerMensajes = async (req, res) => {
  try {
    // Verificar si el usuario es admin (debería validarse en el middleware)
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'Acceso denegado: solo administradores pueden ver mensajes de contacto.' });
    }
    
    const mensajes = await Contacto.find().sort({ fecha: -1 });
    res.json(mensajes);
  } catch (error) {
    console.error('Error al obtener mensajes de contacto:', error);
    res.status(500).json({ mensaje: 'Error al obtener mensajes' });
  }
};

// Eliminar un mensaje por ID (solo si el usuario es admin)
exports.eliminarMensaje = async (req, res) => {
  try {
    const mensajeId = req.params.id;

    // Verificación de rol (solo admins pueden eliminar)
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'Acceso denegado: solo administradores pueden eliminar mensajes.' });
    }

    const mensajeEliminado = await Contacto.findByIdAndDelete(mensajeId);

    if (!mensajeEliminado) {
      return res.status(404).json({ mensaje: 'Mensaje no encontrado' });
    }

    res.status(200).json({ mensaje: 'Mensaje eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el mensaje:', error);
    res.status(500).json({ mensaje: 'Error al eliminar el mensaje', error });
  }
};