import React, { useState } from 'react';
import { ArrowLeft, KeyRound, CheckCircle } from 'lucide-react';
import axios from 'axios';
import api from '../api/api';

interface ResetPasswordProps {
    token: string;
    onBack: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ token, onBack }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { token, newPassword });
            setSubmitted(true);
        } catch (err: unknown) {
            console.error(err);
            if (axios.isAxiosError<string>(err)) {
                setError(err.response?.data || 'Ha ocurrido un error al cambiar la contraseña. El enlace puede haber expirado.');
            } else {
                setError('Ha ocurrido un error al cambiar la contraseña. El enlace puede haber expirado.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-screen h-screen flex items-center justify-center bg-slate-50 p-6">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10">
                {!submitted ? (
                    <>
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <KeyRound className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900">Nueva contraseña</h2>
                            <p className="text-slate-500 mt-2">Crea una nueva clave de acceso para tu cuenta.</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex font-medium">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Nueva clave</label>
                                <div className="relative">
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="password"
                                        className="w-full pl-12 pr-4 py-4 border-2 border-slate-100 rounded-xl focus:border-blue-600 outline-none transition-all"
                                        placeholder="Min. 8 caracteres"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        required
                                        minLength={8}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Confirmar clave</label>
                                <div className="relative">
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="password"
                                        className="w-full pl-12 pr-4 py-4 border-2 border-slate-100 rounded-xl focus:border-blue-600 outline-none transition-all"
                                        placeholder="Repite la clave"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={8}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg"
                            >
                                {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                        <h2 className="text-3xl font-bold text-slate-900">¡Actualizada!</h2>
                        <p className="text-slate-500 mt-4 mb-8">
                            Tu contraseña ha sido actualizada con éxito.
                        </p>
                        <button
                            onClick={onBack}
                            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg"
                        >
                            Iniciar sesión
                        </button>
                    </div>
                )}
                
                {!submitted && (
                    <button
                        onClick={onBack}
                        className="w-full mt-6 flex items-center justify-center gap-2 text-slate-500 hover:text-blue-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
                    </button>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
