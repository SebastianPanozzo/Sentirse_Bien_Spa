const Cliente = require('../models/Cliente');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Obtener todos los clientes (solo para administradores)
exports.obtenerClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find().select('-contrasena'); // Ocultamos la contraseña
    res.json(clientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener los clientes' });
  }
};

// Crear nuevo cliente con hash de contraseña
exports.crearCliente = async (req, res) => {
  const { nombreUsuario, contrasena, nombre, cuil, telefono, email, fechaNacimiento, rol } = req.body;

  if (!nombreUsuario || !contrasena || !nombre || !cuil || !telefono || !email) {
    return res.status(400).json({ mensaje: 'Todos los campos obligatorios deben estar completos' });
  }

  try {
    const clienteExistente = await Cliente.findOne({ nombreUsuario });
    if (clienteExistente) {
      return res.status(400).json({ mensaje: 'El nombre de usuario ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const nuevoCliente = new Cliente({
      nombreUsuario,
      contrasena: hashedPassword,
      nombre,
      cuil,
      telefono,
      email,
      fechaNacimiento,
      rol: rol || 'usuario'
    });

    await nuevoCliente.save();
    res.status(201).json({ mensaje: 'Cliente registrado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al registrar el cliente' });
  }
};

// Actualizar cliente
exports.actualizarCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cliente) return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar el cliente' });
  }
};

// Eliminar cliente
exports.eliminarCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndDelete(req.params.id);
    if (!cliente) return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    res.json({ mensaje: 'Cliente eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar el cliente' });
  }
};

// Login cliente con generación de token
exports.loginCliente = async (req, res) => {
  const { nombreUsuario, contrasena } = req.body;

  try {
    const cliente = await Cliente.findOne({ nombreUsuario });

    if (!cliente) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const esValida = await bcrypt.compare(contrasena, cliente.contrasena);
    if (!esValida) {
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }

    // Validar si JWT_SECRET está definido
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET no está definido en el archivo .env');
      return res.status(500).json({ success: false, message: 'Error del servidor: Falta configuración del token' });
    }

    // Crear token JWT
    const token = jwt.sign(
      {
        id: cliente._id,
        rol: cliente.rol,
        nombreUsuario: cliente.nombreUsuario
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      cliente: {
        id: cliente._id,
        nombreUsuario: cliente.nombreUsuario,
        nombre: cliente.nombre,
        email: cliente.email,
        rol: cliente.rol
      }
    });
  } catch (error) {
    console.error('❌ Error en loginCliente:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};
