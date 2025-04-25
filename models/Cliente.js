const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
  nombreUsuario: {
    type: String,
    required: [true, 'El nombre de usuario es obligatorio'],
    unique: true,
    trim: true
  },
  contrasena: {
    type: String,
    required: [true, 'La contraseña es obligatoria']
    // Idealmente, hasheada con bcrypt en entorno real
  },
  nombre: {
    type: String,
    required: [true, 'El nombre completo es obligatorio'],
    trim: true
  },
  cuil: {
    type: String,
    required: [true, 'El CUIL es obligatorio'],
    unique: true,
    trim: true,
    match: [/^\d{11}$/, 'El CUIL debe tener 11 dígitos']
  },
  telefono: {
    type: String,
    required: [true, 'El teléfono es obligatorio'],
    trim: true,
    match: [/^\d{10,15}$/, 'El teléfono debe tener entre 10 y 15 dígitos']
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    trim: true,
    lowercase: true,
    unique: true,
    match: [/\S+@\S+\.\S+/, 'Formato de email inválido']
  },
  fechaNacimiento: {
    type: Date
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  },
  rol: {
    type: String,
    enum: ['usuario', 'admin'],
    default: 'usuario'
  }
});

module.exports = mongoose.model('Cliente', ClienteSchema);
