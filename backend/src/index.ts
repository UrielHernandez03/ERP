import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import categoryRoutes from './routes/categoryRoutes';
import productRoutes from './routes/productRoutes';
import providerRoutes from './routes/providerRoutes';
import inventoryRoutes from './routes/inventoryRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/inventory', inventoryRoutes);

// Ruta base
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Bienvenido a la API de InventoryPro ERP' });
});

// Inicializar el servidor
app.listen(PORT, () => {
  console.log(`Servidor de InventoryPro ERP corriendo en el puerto ${PORT}`);
});
