// controllers/comentariosController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear un nuevo comentario
exports.crearComentario = async (req, res) => {
  try {
    const { contenido, puntuacion } = req.body;
    const clienteId = req.usuario.id; // Obtenido del token

    const nuevoComentario = await prisma.comentario.create({
      data: {
        clienteId: parseInt(clienteId),
        contenido,
        puntuacion: parseInt(puntuacion)
      }
    });
    
    res.status(201).json(nuevoComentario);
  } catch (error) {
    console.error('Error al guardar el comentario:', error);
    res.status(500).json({ mensaje: 'Error al guardar el comentario' });
  }
};

// Obtener todos los comentarios
exports.obtenerComentarios = async (req, res) => {
  try {
    const comentarios = await prisma.comentario.findMany({
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            nombreUsuario: true
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      }
    });
    
    res.json(comentarios);
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).json({ mensaje: 'Error al obtener comentarios' });
  }
};

// Eliminar un comentario por ID (solo si el usuario es admin)
exports.eliminarComentario = async (req, res) => {
  try {
    const comentarioId = parseInt(req.params.id);

    // ✅ Verificación de rol (solo admins pueden eliminar)
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'Acceso denegado: solo administradores pueden eliminar comentarios.' });
    }

    const comentarioEliminado = await prisma.comentario.delete({
      where: { id: comentarioId }
    });

    if (!comentarioEliminado) {
      return res.status(404).json({ mensaje: 'Comentario no encontrado' });
    }

    res.status(200).json({ mensaje: 'Comentario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el comentario:', error);
    res.status(500).json({ mensaje: 'Error al eliminar el comentario', error });
  }
};