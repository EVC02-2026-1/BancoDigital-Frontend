import React, { useState } from 'react';
import { Mail, ArrowLeft, KeyRound, CheckCircle } from 'lucide-react';
import axios from 'axios';
import api from '../api/api';

interface ForgotPasswordProps {
    onBack: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        try {
            await api.post('/auth/forgot-password', { email });
            setSubmitted(true);
        } catch (err: unknown) {
            console.error(err);
            if (axios.isAxiosError<{ message?: string }>(err)) {
                setErrorMsg(err.response?.data?.message || 'Error al conectar con el servidor. Verifica que el backend esté corriendo.');
            } else {
                setErrorMsg('Error al conectar con el servidor. Verifica que el backend esté corriendo.');
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
                            <h2 className="text-3xl font-bold text-slate-900">¿Olvidaste tu clave?</h2>
                            <p className="text-slate-500 mt-2">No te preocupes, te enviaremos instrucciones para recuperarla.</p>
                        </div>
                        {errorMsg && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center">
                                {errorMsg}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Correo electrónico</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        className="w-full pl-12 pr-4 py-4 border-2 border-slate-100 rounded-xl focus:border-blue-600 outline-none transition-all"
                                        placeholder="tu@email.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg"
                            >
                                {loading ? 'Enviando...' : 'Enviar instrucciones'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-12 h-12" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900">¡Correo enviado!</h2>
                        <div className="bg-green-50 border border-green-100 p-6 rounded-2xl mt-6 mb-8">
                            <p className="text-green-800 font-medium">
                                Hemos enviado instrucciones a:<br/>
                                <span className="text-green-600 font-bold">{email}</span>
                            </p>
                            <p className="text-green-700 text-sm mt-3 flex items-center justify-center gap-2">
                                <Mail className="w-4 h-4" /> Por favor, revisa tu bandeja de entrada.
                            </p>
                        </div>
                        <p className="text-slate-500 text-sm">
                            ¿No recibiste el correo? Revisa tu carpeta de spam o intenta de nuevo en unos minutos.
                        </p>
                    </div>
                )}
                
                <button
                    onClick={onBack}
                    className="w-full mt-6 flex items-center justify-center gap-2 text-slate-500 hover:text-blue-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
                </button>
            </div>
        </div>
    );
};

export default ForgotPassword;
