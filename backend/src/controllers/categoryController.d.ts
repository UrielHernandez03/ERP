import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
export declare const getCategories: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createCategory: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateCategory: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteCategory: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=categoryController.d.ts.map