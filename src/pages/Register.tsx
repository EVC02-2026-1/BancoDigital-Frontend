import React, { useState } from 'react';
import { Mail, Lock, User, Wallet, Upload, CheckCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';
import api from '../api/api';

interface RegisterUserData {
    name: string;
    email: string;
    verified: boolean;
}

interface RegisterProps {
    onSuccess: (userData: RegisterUserData) => void;
    onBack: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSuccess, onBack }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [dniFront, setDniFront] = useState<File | null>(null);
    const [dniBack, setDniBack] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleNext = () => setStep(step + 1);
    const handlePrev = () => setStep(step - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!dniFront || !dniBack) {
            setError('Por favor sube ambos lados del DNI');
            return;
        }

        setLoading(true);
        setError('');

        const data = new FormData();
        data.append('data', new Blob([JSON.stringify(formData)], { type: 'application/json' }));
        data.append('dniFront', dniFront);
        data.append('dniBack', dniBack);

        try {
            const response = await api.post('/auth/register', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const { token } = response.data;
            sessionStorage.setItem('token', token);
            setStep(3);
        } catch (err: unknown) {
            if (axios.isAxiosError<string>(err)) {
                setError(err.response?.data || 'Error en el registro');
            } else {
                setError('Error en el registro');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-screen h-screen flex bg-slate-50 overflow-y-auto">
            <div className="hidden lg:flex lg:w-1/3 bg-blue-700 p-12 flex-col justify-between text-white">
                <div>
                    <div className="flex items-center gap-3 mb-12">
                        <Wallet className="w-8 h-8" />
                        <span className="text-2xl font-bold">BancoDigital</span>
                    </div>
                    <h2 className="text-4xl font-bold mb-6">Únete a la banca del futuro</h2>
                    <ul className="space-y-4">
                        <li className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-blue-300" />
                            <span>Cuentas sin comisiones</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-10">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">
                            {step === 1 ? 'Crea tu cuenta' : 'Verifica tu identidad'}
                        </h1>
                        <p className="text-slate-500">
                            {step === 1 ? 'Ingresa tus datos personales' : 'Sube fotos nítidas de tu DNI'}
                        </p>
                    </div>

                    {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">{error}</div>}

                    {step === 3 ? (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-12 h-12" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900">¡Registro exitoso!</h2>
                            <div className="bg-green-50 border border-green-100 p-6 rounded-2xl mt-6 mb-8 text-center">
                                <p className="text-green-800 font-medium">
                                    Bienvenido a BancoDigital, <span className="font-bold">{formData.name}</span>.
                                </p>
                                <p className="text-green-700 text-sm mt-3 flex items-center justify-center gap-2">
                                    <Mail className="w-4 h-4" /> Hemos enviado un correo de verificación a su cuenta.
                                </p>
                            </div>
                            <p className="text-slate-500 mb-8">
                                Por favor, revisa tu bandeja de entrada para activar tu cuenta.
                            </p>
                            <button
                                onClick={() => onSuccess({ name: formData.name, email: formData.email, verified: false })}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                Ir al Dashboard <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <>
                            {step === 1 ? (
                                <div className="space-y-6">
                                    {/* ... existing step 1 inputs ... */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Nombre Completo</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="text"
                                                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                                                placeholder="Ej. Juan Pérez"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="email"
                                                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                                                placeholder="tu@email.com"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Contraseña</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="password"
                                                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleNext}
                                        disabled={!formData.name || !formData.email || !formData.password}
                                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all"
                                    >
                                        Continuar <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-slate-700">DNI Frontal</p>
                                            <label className="cursor-pointer border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center hover:border-blue-400 transition-colors bg-slate-50">
                                                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                                <span className="text-xs text-slate-500 text-center">{dniFront ? dniFront.name : 'Subir foto'}</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) setDniFront(f); }} />
                                            </label>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-slate-700">DNI Trasero</p>
                                            <label className="cursor-pointer border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center hover:border-blue-400 transition-colors bg-slate-50">
                                                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                                <span className="text-xs text-slate-500 text-center">{dniBack ? dniBack.name : 'Subir foto'}</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) setDniBack(f); }} />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={handlePrev}
                                            className="flex-1 border border-slate-200 text-slate-600 py-4 rounded-xl font-bold hover:bg-slate-50"
                                        >
                                            Atrás
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={loading || !dniFront || !dniBack}
                                            className="flex-2 bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {loading ? 'Procesando...' : 'Finalizar Registro'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 text-center">
                                <button onClick={onBack} className="text-slate-500 hover:text-blue-600 underline text-sm">
                                    ¿Ya tienes cuenta? Inicia sesión
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Register;
