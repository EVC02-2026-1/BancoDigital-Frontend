import React from 'react';
import {
    ArrowLeft,
    User,
    Mail,
    ShieldCheck,
    ShieldAlert,
    KeyRound,
    LogOut,
} from 'lucide-react';

interface ProfileUser {
    name?: string;
    email?: string;
    verified?: boolean;
}

interface ProfileProps {
    user?: ProfileUser;
    onBack: () => void;
    onChangePassword: () => void;
    onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({
    user,
    onBack,
    onChangePassword,
    onLogout,
}) => {
    return (
        <div className="w-full h-screen flex flex-col bg-slate-50 overflow-hidden">
            {/* Header */}
            <div className="p-8 flex items-center gap-4 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <button
                    onClick={onBack}
                    className="p-3 hover:bg-slate-100 rounded-xl transition-all"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-600" />
                </button>
                <h1 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">
                    Mi Perfil
                </h1>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Avatar + Info Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="bg-linear-to-br from-blue-700 to-indigo-900 px-10 pt-10 pb-16 relative">
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white/30 shadow-xl bg-white/10 flex items-center justify-center shrink-0">
                                    <User className="w-12 h-12 text-white/60" />
                                </div>
                                <div>
                                    <p className="text-white text-3xl font-black italic leading-tight">
                                        {user?.name || 'Cliente'}
                                    </p>
                                    <p className="text-blue-200 text-sm font-medium mt-1">
                                        {user?.email || '—'}
                                    </p>
                                    <div className="mt-3">
                                        {user?.verified ? (
                                            <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                                                <ShieldCheck className="w-3.5 h-3.5" />{' '}
                                                Verificado
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                                                <ShieldAlert className="w-3.5 h-3.5" />{' '}
                                                Sin verificar
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info rows */}
                        <div className="mt-6 mx-6 bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-50">
                            <div className="flex items-center gap-4 px-6 py-4">
                                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                                    <User className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Nombre
                                    </p>
                                    <p className="text-slate-900 font-bold">
                                        {user?.name || '—'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 px-6 py-4">
                                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                                    <Mail className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Correo electrónico
                                    </p>
                                    <p className="text-slate-900 font-bold">
                                        {user?.email || '—'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="h-6" />
                    </div>

                    {/* Security / Actions */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-3">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">
                            Seguridad
                        </h2>

                        <button
                            onClick={onChangePassword}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-blue-50 group transition-all text-left"
                        >
                            <div className="w-10 h-10 bg-blue-50 group-hover:bg-blue-600 rounded-xl flex items-center justify-center transition-all shrink-0">
                                <KeyRound className="w-5 h-5 text-blue-600 group-hover:text-white transition-all" />
                            </div>
                            <div>
                                <p className="text-slate-900 font-black text-sm">
                                    Cambiar contraseña
                                </p>
                                <p className="text-slate-400 text-xs font-medium">
                                    Recibirás un enlace en tu correo
                                </p>
                            </div>
                        </button>

                        <button
                            onClick={onLogout}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-50 group transition-all text-left"
                        >
                            <div className="w-10 h-10 bg-red-50 group-hover:bg-red-500 rounded-xl flex items-center justify-center transition-all shrink-0">
                                <LogOut className="w-5 h-5 text-red-500 group-hover:text-white transition-all" />
                            </div>
                            <div>
                                <p className="text-red-500 font-black text-sm">
                                    Cerrar sesión
                                </p>
                                <p className="text-slate-400 text-xs font-medium">
                                    Salir de tu cuenta de forma segura
                                </p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
