import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Redirigir la raíz al login por ahora */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* Placeholder para el dashboard */}
        <Route path="/dashboard" element={<div className="p-8 text-2xl">Bienvenido al Dashboard (En construcción...)</div>} />
      </Routes>
    </Router>
  );
}

export default App;
