import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PackageOpen, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import axiosInstance from '../api/axios';

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      await axiosInstance.post('/auth/reset-password', { 
        token, 
        newPassword 
      });
      setSuccess(true);
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 transform transition-transform hover:scale-105">
            <PackageOpen className="text-white w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Nueva Contraseña
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Por favor ingresa tu nueva contraseña segura
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-white/20">
          
          {success ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <Lock className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">¡Contraseña cambiada!</h3>
              <p className="mt-2 text-sm text-gray-500">
                Tu contraseña ha sido actualizada con éxito de forma segura. Serás redirigido al inicio de sesión.
              </p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center animate-pulse">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nueva contraseña
                </label>
                <div className="mt-2 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={8}
                    maxLength={20}
                    value={newPassword}
                    onChange={(e) => {
                      // Filtro anti caracteres especiales
                      e.target.value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                      setNewPassword(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      // Bloqueo físico de símbolos
                      if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white/50 focus:bg-white"
                    placeholder="8 a 20 caracteres"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirmar contraseña
                </label>
                <div className="mt-2 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={8}
                    maxLength={20}
                    value={confirmPassword}
                    onChange={(e) => {
                      // Filtro anti caracteres especiales
                      e.target.value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                      setConfirmPassword(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      // Bloqueo físico de símbolos
                      if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white/50 focus:bg-white"
                    placeholder="Repite tu contraseña"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/30 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-all hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
                >
                  {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
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

export default ResetPassword;
