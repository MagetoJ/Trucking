"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./env");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const bookings_1 = __importDefault(require("./routes/bookings"));
const auth_1 = __importDefault(require("./routes/auth"));
const admin_1 = __importDefault(require("./routes/admin"));
const adminDashboard_1 = __importDefault(require("./routes/adminDashboard"));
const kyc_1 = __importDefault(require("./routes/kyc"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Dynamic CORS registration: uses FRONTEND_URL environment variable in production,
// falling back to local port 3000 during development workflows.
// Sanitized code that removes any accidental trailing slash to prevent CORS mismatches
const rawOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
const allowedOrigin = rawOrigin.endsWith('/') ? rawOrigin.slice(0, -1) : rawOrigin;
app.use((0, cors_1.default)({
    origin: allowedOrigin,
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Bind your application route configurations
app.use('/api/auth', auth_1.default);
app.use('/api/bookings', bookings_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/admin-dashboard', adminDashboard_1.default);
app.use('/api/kyc', kyc_1.default);
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', platform: 'TruckHub Engine' });
});
app.listen(PORT, () => {
    console.log(`🚀 Standalone TruckHub Backend Server listening smoothly on port: ${PORT}`);
});
