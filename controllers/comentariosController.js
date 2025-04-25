const Comentario = require('../models/Comentario');

// Crear un nuevo comentario
exports.crearComentario = async (req, res) => {
  try {
    const nuevoComentario = new Comentario(req.body);
    await nuevoComentario.save();
    res.status(201).json(nuevoComentario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al guardar el comentario' });
  }
};

// Obtener todos los comentarios
exports.obtenerComentarios = async (req, res) => {
  try {
    const comentarios = await Comentario.find().sort({ fecha: -1 });
    res.json(comentarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener comentarios' });
  }
};

// Eliminar un comentario por ID (solo si el usuario es admin)
exports.eliminarComentario = async (req, res) => {
  try {
    const comentarioId = req.params.id;

    // ✅ Verificación de rol (solo admins pueden eliminar)
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'Acceso denegado: solo administradores pueden eliminar comentarios.' });
    }

    const comentarioEliminado = await Comentario.findByIdAndDelete(comentarioId);

    if (!comentarioEliminado) {
      return res.status(404).json({ mensaje: 'Comentario no encontrado' });
    }

    res.status(200).json({ mensaje: 'Comentario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el comentario', error });
  }
};
