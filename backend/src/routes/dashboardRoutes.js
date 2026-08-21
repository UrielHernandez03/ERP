"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboardController_1 = require("../controllers/dashboardController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Protegemos todas las rutas de este router con el middleware
router.use(authMiddleware_1.authenticate);
router.get('/stats', dashboardController_1.getDashboardStats);
exports.default = router;
//# sourceMappingURL=dashboardRoutes.js.map