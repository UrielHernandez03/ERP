import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
export declare const getProviders: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createProvider: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateProvider: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteProvider: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=providerController.d.ts.map