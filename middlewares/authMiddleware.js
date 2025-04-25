// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.verificarToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ mensaje: 'Acceso denegado, token no proporcionado' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido' });
  }
};

exports.soloAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Acceso denegado, se requiere rol de administrador' });
  }
  next();
};