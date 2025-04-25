const mongoose = require('mongoose');

const ContactoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    trim: true,
    match: [/\S+@\S+\.\S+/, 'Formato de email inválido']
  },
  telefono: {
    type: String,
    required: [true, 'El teléfono es obligatorio'],
    trim: true
  },
  mensaje: {
    type: String,
    required: [true, 'El mensaje es obligatorio']
  },
  fecha: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Contacto', ContactoSchema);