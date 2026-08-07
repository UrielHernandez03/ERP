import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PackageOpen, Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import axiosInstance from '../api/axios';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [simulationToken, setSimulationToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axiosInstance.post('/auth/forgot-password', { email });
      setSuccess(true);
      // MODO DESARROLLO: Si el backend nos dio un token simulado, lo guardamos para el botón
      if (res.data.simulationToken) {
        setSimulationToken(res.data.simulationToken);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al solicitar recuperación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 transform transition-transform hover:scale-105">
            <PackageOpen className="text-white w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Recuperar Contraseña
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Te enviaremos instrucciones a tu correo
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-white/20">
          
          {success ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Enlace enviado</h3>
              <p className="mt-2 text-sm text-gray-500">
                Si el correo <span className="font-semibold text-gray-900">{email}</span> está registrado en nuestro sistema, recibirás un enlace para restablecer tu contraseña.
              </p>
              
              {simulationToken && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <p className="text-xs text-yellow-800 mb-3">
                    [MODO SIMULADOR] Haz clic abajo para probar la pantalla de cambio como si hubieras recibido el correo.
                  </p>
                  <Link 
                    to={`/reset-password/${simulationToken}`} 
                    className="w-full flex justify-center items-center py-2 px-4 border border-yellow-300 rounded-lg shadow-sm text-sm font-medium text-yellow-800 bg-yellow-100 hover:bg-yellow-200 transition-colors"
                  >
                    Simular Correo Recibido (Ir a Cambiar Contraseña)
                  </Link>
                </div>
              )}

              <div className="mt-6">
                <Link to="/login" className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                  Volver al inicio de sesión
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center animate-pulse">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <div className="mt-2 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={100}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors bg-white/50 focus:bg-white"
                    placeholder="tucorreo@ejemplo.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/30 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
                >
                  {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </button>
              </div>
              
              <div className="mt-4 flex items-center justify-center">
                <Link to="/login" className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al inicio de sesión
                </Link>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
