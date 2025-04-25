const mongoose = require('mongoose');

const ComentarioSchema = new mongoose.Schema({
  titulo: String,
  contenido: String,
  alias: String,
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comentario', ComentarioSchema);
