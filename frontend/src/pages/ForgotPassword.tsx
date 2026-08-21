import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PackageOpen, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic Glowing Mesh Background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full filter blur-3xl"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 transform transition-transform hover:scale-105 hover:rotate-3">
            <PackageOpen className="text-white w-8 h-8 animate-bounce" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
          Recuperar Contraseña
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400 font-medium">
          Te enviaremos instrucciones a tu correo
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900/50 backdrop-blur-2xl py-8 px-6 shadow-2xl sm:rounded-3xl sm:px-10 border border-slate-800/80">
          
          {success ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-500/10 mb-4 border border-green-500/20">
                <CheckCircle2 className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Enlace enviado</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Si el correo <span className="font-semibold text-white">{email}</span> está registrado, recibirás un enlace para restablecer tu contraseña.
              </p>
              
              {simulationToken && (
                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
                  <p className="text-[10px] text-yellow-400 mb-3 leading-relaxed">
                    [MODO SIMULADOR] Haz clic abajo para probar la pantalla de cambio como si hubieras recibido el correo.
                  </p>
                  <Link 
                    to={`/reset-password/${simulationToken}`} 
                    className="w-full flex justify-center items-center py-2 px-4 border border-yellow-500/30 rounded-xl text-[10px] font-bold text-yellow-400 bg-yellow-500/5 hover:bg-yellow-500/20 transition-all"
                  >
                    Simular Correo Recibido (Ir a Cambiar Contraseña)
                  </Link>
                </div>
              )}

              <div className="mt-6">
                <Link 
                  to="/login" 
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all cursor-pointer"
                >
                  Volver al inicio de sesión
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center animate-pulse">
                  <p className="text-xs font-semibold text-red-400">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Correo electrónico
                </label>
                <div className="mt-2 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4.5 w-4.5 text-slate-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={100}
                    value={email}
                    onChange={(e) => setEmail(e.target.value.replace(/[^a-zA-Z0-9@._-]/g, ''))}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all bg-slate-950/40 text-white placeholder-slate-600 focus:bg-slate-950/80"
                    placeholder="tucorreo@ejemplo.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-70 disabled:hover:scale-100 cursor-pointer"
                >
                  {loading ? 'Solicitando...' : 'Recuperar contraseña'}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </button>
              </div>
            </form>
          )}

          {!success && (
            <div className="mt-6 text-center text-xs font-semibold">
              <Link to="/login" className="text-slate-400 hover:text-white transition-colors">
                Volver al inicio de sesión
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
