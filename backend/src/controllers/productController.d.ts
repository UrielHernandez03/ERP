import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
export declare const getProducts: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createProduct: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateProduct: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteProduct: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=productController.d.ts.map