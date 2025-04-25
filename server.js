// server.js
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
const clientesRoutes = require('./routes/clientes');
const reservasRoutes = require('./routes/reservas');
const comentariosRoutes = require('./routes/comentarios');
const contactoRoutes = require('./routes/contacto');
const prisma = new PrismaClient();

// Rutas
app.use('/api/clientes', clientesRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/comentarios', comentariosRoutes);
app.use('/api/contacto', contactoRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API funcionando correctamente');
});


// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ mensaje: 'Error del servidor' });
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

// Cierre limpio de Prisma
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});