// backend-spa/middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');

// Middleware para verificar el token JWT
const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Verifica que exista el encabezado y que tenga formato 'Bearer token'
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token requerido." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verifica el token usando la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secreto123");
    req.usuario = decoded; // Guarda los datos del usuario en la request
    next(); // Continúa con el siguiente middleware o controlador
  } catch (error) {
    return res.status(401).json({ message: "Token inválido o expirado." });
  }
};

// Middleware para restringir acceso solo a administradores
const soloAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.rol !== "admin") {
    return res.status(403).json({ message: "Acceso denegado. Solo administradores." });
  }
  next();
};

module.exports = { verificarToken, soloAdmin };
