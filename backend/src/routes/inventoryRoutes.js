"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventoryController_1 = require("../controllers/inventoryController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.authenticate, inventoryController_1.getTransactions);
router.post('/', authMiddleware_1.authenticate, inventoryController_1.createTransaction);
exports.default = router;
//# sourceMappingURL=inventoryRoutes.js.map