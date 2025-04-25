const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },
  servicio: {
    type: String,
    required: true
  },
  fecha: {
    type: Date,
    required: true
  },
  hora: {
    type: String,
    required: true
  },
  estado: {
    type: String,
    enum: ['confirmada'],
    default: 'confirmada'
  },
  esGrupal: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Índice para buscar reservas más eficientemente
reservaSchema.index({ servicio: 1, fecha: 1, hora: 1 });

module.exports = mongoose.model('Reserva', reservaSchema);