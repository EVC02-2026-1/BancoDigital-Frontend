import React, { useState } from 'react';
import { Mail, Lock, User, Wallet, Upload, CheckCircle, ArrowRight, Loader2, AlertCircle, Phone } from 'lucide-react';
import Tesseract from 'tesseract.js';
import api from '../api/api';

interface RegisterProps {
    onSuccess: (userData: any) => void;
    onBack: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSuccess, onBack }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        documentNumber: '',
        expeditionDate: '',
        expeditionPlace: '',
        phoneNumber: '',
    });
    const [dniFront, setDniFront] = useState<File | null>(null);
    const [dniBack, setDniBack] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [ocrLoading, setOcrLoading] = useState(false);
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [kycError, setKycError] = useState('');
    const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
    const [checkingEmail, setCheckingEmail] = useState(false);

    const checkEmailAvailability = async (email: string) => {
        if (!email || !email.includes('@')) return;
        setCheckingEmail(true);
        setEmailError('');
        try {
            const response = await api.get(`/auth/check-email?email=${email}`);
            if (response.data.exists) {
                setEmailError('Este correo ya está en uso');
            }
        } catch (err) {
            console.error("Error comprobando email:", err);
        } finally {
            setCheckingEmail(false);
        }
    };

    const isPasswordValid = (pass: string) => {
        return pass.length >= 8 && /\d/.test(pass) && /[^A-Za-z0-9]/.test(pass);
    };

    const isStep1Valid = 
        formData.name.trim() !== '' && 
        formData.email.trim() !== '' && 
        !emailError &&
        formData.phoneNumber.length === 10 &&
        isPasswordValid(formData.password) && 
        formData.documentNumber.trim() !== '' && 
        formData.expeditionDate !== '' && 
        formData.expeditionPlace.trim() !== '';

    const handleDniFrontChange = async (file: File) => {
        setDniFront(file);
        setOcrLoading(true);
        try {
            const result = await Tesseract.recognize(file, 'spa', {
                logger: m => console.log(m)
            });
            
            // Buscar un número de 8 a 10 dígitos (ajustable según país)
            const docMatch = result.data.text.match(/\b\d{8,10}\b/);
            if (docMatch) {
                setFormData(prev => ({ ...prev, documentNumber: docMatch[0] }));
            }
        } catch (err) {
            console.error("Error OCR:", err);
        } finally {
            setOcrLoading(false);
        }
    };

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
            const response = await api.post('/auth/register', data);
            const { token } = response.data;
            sessionStorage.setItem('token', token); // Guardar token temporal para la verificación
            setStep(3); // Mostrar mensaje de éxito y aviso de correo
        } catch (err: any) {
            const errorMsg = err.response?.data || 'Error en el registro';
            if (errorMsg.includes('registraduría')) {
                setKycError(errorMsg);
            } else {
                setError(errorMsg);
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

                    {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-2 animation-shake">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm">{error}</span>
                    </div>}

                    {kycError && (
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center animation-bounce-in">
                                <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <AlertCircle className="w-12 h-12" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Validación Fallida</h3>
                                <p className="text-slate-600 text-sm leading-relaxed mb-8">
                                    {kycError}
                                </p>
                                <button 
                                    onClick={() => setKycError('')}
                                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
                                >
                                    Entendido
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 ? (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-12 h-12" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900">¡Registroitoso!</h2>
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
                                onClick={() => onSuccess(formData)}
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
                                                className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 outline-none transition-all ${
                                                    emailError ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-slate-200 focus:ring-blue-600'
                                                }`}
                                                placeholder="tu@email.com"
                                                value={formData.email}
                                                onChange={e => {
                                                    setFormData({ ...formData, email: e.target.value });
                                                    if (emailError) setEmailError('');
                                                }}
                                                onBlur={e => checkEmailAvailability(e.target.value)}
                                            />
                                            {checkingEmail && (
                                                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600 animate-spin" />
                                            )}
                                        </div>
                                        {emailError && (
                                            <p className="mt-1 text-[11px] text-red-600 font-medium flex items-center gap-1 animation-shake">
                                                <AlertCircle className="w-3 h-3" /> {emailError}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Teléfono</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="tel"
                                                maxLength={10}
                                                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 outline-none transition-all ${
                                                    formData.phoneNumber && formData.phoneNumber.length !== 10 ? 'border-amber-300 focus:ring-amber-500 bg-amber-50' : 'border-slate-200 focus:ring-blue-600'
                                                }`}
                                                placeholder="Ej. 3001234567"
                                                value={formData.phoneNumber}
                                                onChange={e => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    setFormData({ ...formData, phoneNumber: val });
                                                }}
                                            />
                                        </div>
                                        {formData.phoneNumber && formData.phoneNumber.length !== 10 && (
                                            <p className="mt-1 text-[10px] text-amber-600 font-medium">Debe tener 10 dígitos</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Contraseña</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="password"
                                                className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 outline-none transition-all ${
                                                    formData.password ? (isPasswordValid(formData.password) ? 'border-green-200 focus:ring-green-500' : 'border-amber-200 focus:ring-amber-500') : 'border-slate-200 focus:ring-blue-600'
                                                }`}
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onFocus={() => setShowPasswordRequirements(true)}
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            />
                                        </div>
                                        {showPasswordRequirements && (
                                            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] space-y-1 animation-slide-down">
                                                <p className="font-bold text-slate-600 mb-1">Requisitos de contraseña:</p>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-slate-300'}`} />
                                                    <span className={formData.password.length >= 8 ? 'text-green-600' : 'text-slate-500'}>Mínimo 8 caracteres</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${/\d/.test(formData.password) ? 'bg-green-500' : 'bg-slate-300'}`} />
                                                    <span className={/\d/.test(formData.password) ? 'text-green-600' : 'text-slate-500'}>Al menos un número</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${/[^A-Za-z0-9]/.test(formData.password) ? 'bg-green-500' : 'bg-slate-300'}`} />
                                                    <span className={/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-600' : 'text-slate-500'}>Al menos un símbolo (ej. !@#$)</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Número de Documento</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                                                placeholder="Ej. 1035520443"
                                                value={formData.documentNumber}
                                                onChange={e => setFormData({ ...formData, documentNumber: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Fecha Expedición</label>
                                            <input
                                                type="date"
                                                max={new Date().toISOString().split('T')[0]}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                                                value={formData.expeditionDate}
                                                onChange={e => setFormData({ ...formData, expeditionDate: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Lugar Expedición</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                                                placeholder="Ciudad"
                                                value={formData.expeditionPlace}
                                                onChange={e => setFormData({ ...formData, expeditionPlace: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleNext}
                                        disabled={!isStep1Valid}
                                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:grayscale transition-all"
                                    >
                                        Continuar <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-slate-700">DNI Frontal</p>
                                            <label className="cursor-pointer border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center hover:border-blue-400 transition-colors bg-slate-50 relative overflow-hidden">
                                                {ocrLoading && (
                                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                                                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                                                        <span className="text-[10px] font-bold text-blue-600 uppercase">Leyendo DNI...</span>
                                                    </div>
                                                )}
                                                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                                <span className="text-xs text-slate-500 text-center">{dniFront ? dniFront.name : 'Subir foto'}</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={e => handleDniFrontChange(e.target.files![0])} />
                                            </label>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-slate-700">DNI Trasero</p>
                                            <label className="cursor-pointer border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center hover:border-blue-400 transition-colors bg-slate-50">
                                                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                                <span className="text-xs text-slate-500 text-center">{dniBack ? dniBack.name : 'Subir foto'}</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={e => setDniBack(e.target.files![0])} />
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
                                            className="flex-[2] bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50"
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
