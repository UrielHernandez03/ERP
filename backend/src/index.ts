import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas de la API
app.use('/api/auth', authRoutes);

// Ruta base
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Bienvenido a la API de InventoryPro ERP' });
});

// Inicializar el servidor
app.listen(PORT, () => {
  console.log(`Servidor de InventoryPro ERP corriendo en el puerto ${PORT}`);
});
