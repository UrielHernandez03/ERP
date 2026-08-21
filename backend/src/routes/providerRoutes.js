"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const providerController_1 = require("../controllers/providerController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.authenticate, providerController_1.getProviders);
router.post('/', authMiddleware_1.authenticate, providerController_1.createProvider);
router.put('/:id', authMiddleware_1.authenticate, providerController_1.updateProvider);
router.delete('/:id', authMiddleware_1.authenticate, providerController_1.deleteProvider);
exports.default = router;
//# sourceMappingURL=providerRoutes.js.map