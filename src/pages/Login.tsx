import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, Wallet, AlertCircle } from 'lucide-react';
import axios from 'axios';
import api from '../api/api';

interface UserData {
    name?: string;
    selfie?: string;
}

export interface LoginProps {
    onLogin: (userData: UserData) => void;
    onRegister: () => void;
    onForgot: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegister, onForgot }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data;

            if (rememberMe) {
                localStorage.setItem('token', token);
                localStorage.setItem('rememberedEmail', email);
            } else {
                sessionStorage.setItem('token', token);
                localStorage.removeItem('rememberedEmail');
            }

            onLogin(user);
        } catch (err: unknown) {
            if (axios.isAxiosError<string>(err)) {
                setError(err.response?.data || 'Credenciales inválidas');
            } else {
                setError('Credenciales inválidas');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-screen h-screen flex bg-slate-50 overflow-hidden">
            <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-blue-700 to-indigo-900 p-16 flex-col justify-between text-white shadow-2xl">
                <div>
                    <div className="flex items-center gap-4 mb-16">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/20">
                            <Wallet className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-3xl font-bold tracking-tight">BancoDigital</span>
                    </div>
                    <h1 className="text-6xl font-extrabold mb-8 leading-tight">Maneja tu dinero <br /> <span className="text-blue-300">inteligentemente</span></h1>
                    <p className="text-xl text-blue-100/80 max-w-lg font-light leading-relaxed">
                        Seguridad de primer nivel, transferencias instantáneas y gestión de activos desde la palma de tu mano.
                    </p>
                </div>
                <div className="text-blue-200/50 text-sm font-medium">
                    © 2026 BancoDigital S.A. Todos los derechos reservados.
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-8 bg-white lg:bg-slate-50">
                <div className="w-full max-w-md space-y-10 bg-white p-2 lg:p-10 rounded-3xl lg:shadow-xl">
                    <div>
                        <h2 className="text-slate-900 text-4xl font-black mb-3">¡Hola de nuevo!</h2>
                        <p className="text-slate-500 text-lg">Ingresa a tu cuenta para continuar</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Correo electrónico</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@email.com"
                                    className="w-full pl-12 pr-4 py-4 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Contraseña</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-4 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all font-medium"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 p-1"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-5 h-5 rounded-lg border-2 border-slate-200 text-blue-600 focus:ring-blue-600/20" 
                                />
                                <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Recordarme</span>
                            </label>
                            <button 
                                type="button" 
                                onClick={onForgot}
                                className="text-blue-600 text-sm font-bold hover:text-blue-700 hover:underline decoration-2 underline-offset-4"
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-2xl py-5 transition-all shadow-[0_10px_30px_-10px_rgba(37,99,235,0.4)] text-lg font-bold active:scale-[0.98]"
                        >
                            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                        </button>
                    </form>

                    <div className="pt-6 text-center text-slate-600">
                        <p className="font-medium">
                            ¿Aún no tienes cuenta?{' '}
                            <button 
                                onClick={onRegister}
                                className="text-blue-600 font-black hover:text-blue-800 ml-1 underline underline-offset-4 decoration-2"
                            >
                                Regístrate gratis
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
