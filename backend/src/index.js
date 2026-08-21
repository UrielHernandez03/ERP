"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const providerRoutes_1 = __importDefault(require("./routes/providerRoutes"));
const inventoryRoutes_1 = __importDefault(require("./routes/inventoryRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Rutas de la API
app.use('/api/auth', authRoutes_1.default);
app.use('/api/dashboard', dashboardRoutes_1.default);
app.use('/api/categories', categoryRoutes_1.default);
app.use('/api/products', productRoutes_1.default);
app.use('/api/providers', providerRoutes_1.default);
app.use('/api/inventory', inventoryRoutes_1.default);
// Ruta base
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenido a la API de InventoryPro ERP' });
});
// Inicializar el servidor
app.listen(PORT, () => {
    console.log(`Servidor de InventoryPro ERP corriendo en el puerto ${PORT}`);
});
//# sourceMappingURL=index.js.map