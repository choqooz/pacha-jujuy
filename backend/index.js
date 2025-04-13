import express from 'express';
import cors from 'cors';
import userRoute from './routes/user.routes.js';
import authRoute from './routes/auth.routes.js';
import productRoute from './routes/product.routes.js';
import cartRoute from './routes/cart.routes.js';
import orderRoute from './routes/order.routes.js';
import mercadoPagoRoute from './routes/mercadoPago.routes.js';
import connectedDB from './config/db.js';

const app = express();

// Middlewares
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

// Connect to MongoDB
connectedDB();

// Routes
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/products', productRoute);
app.use('/api/carts', cartRoute);
app.use('/api/orders', orderRoute);
app.use('/api/mp', mercadoPagoRoute);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Backend server is running on port', PORT);
});
