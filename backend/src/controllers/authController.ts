import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { Role } from '@prisma/client';
import { AuthRequest } from '../middlewares/authMiddleware';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Validaciones estrictas
    const nameRegex = /^[A-Za-zÁ-Úá-úñÑ\s]{3,50}$/;
    if (!name || !nameRegex.test(name)) {
      res.status(400).json({ message: 'El nombre debe tener entre 3 y 50 caracteres y solo contener letras.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || email.length > 100) {
      res.status(400).json({ message: 'El formato del correo es inválido o demasiado largo.' });
      return;
    }

    if (!password || password.length < 8 || password.length > 20) {
      res.status(400).json({ message: 'La contraseña debe tener entre 8 y 20 caracteres.' });
      return;
    }

    // Verificar si el usuario ya existe (1 sola consulta)
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ message: 'El correo ya está registrado.' });
      return;
    }

    // Hashear la contraseña por seguridad
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.ADMINISTRADOR, // Usando el enum correcto del schema
      },
    });

    // Crear token para auto-login después de registrarse
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    res.status(201).json({ token, message: 'Usuario creado exitosamente.' });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'El correo y la contraseña son requeridos' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'supersecret_fallback_key',
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'El correo electrónico es requerido.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Simulador de correo: Si el usuario existe, generamos un token real de 15 min.
    // Solo para desarrollo, devolvemos el token en la respuesta.
    // En producción, este token se enviaría por correo y solo se devolvería el mensaje de éxito.
    let simulationToken = null;

    if (user) {
      const resetToken = jwt.sign(
        { id: user.id, isReset: true }, 
        process.env.JWT_SECRET as string, 
        { expiresIn: '15m' }
      );
      
      simulationToken = resetToken;
      console.log(`[Simulación] Se solicitó recuperación de contraseña para: ${email}`);
    }

    res.json({ 
      message: 'Si el correo existe, se han enviado las instrucciones de recuperación.',
      // ATENCIÓN: Solo exponer token en modo desarrollo por no tener servicio de correo activo
      simulationToken
    });
  } catch (error) {
    console.error('Error en forgotPassword:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ message: 'Token y nueva contraseña son requeridos.' });
      return;
    }

    // 1. Verificar Token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number; isReset?: boolean };
    } catch (error) {
      res.status(401).json({ message: 'Token inválido o expirado. Solicite uno nuevo.' });
      return;
    }

    if (!decoded.isReset) {
      res.status(401).json({ message: 'Token inválido para esta operación.' });
      return;
    }

    // 2. Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Actualizar en Base de Datos de forma limpia
    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Contraseña actualizada con éxito.' });
  } catch (error) {
    console.error('Error en resetPassword:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Error en getMe:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
