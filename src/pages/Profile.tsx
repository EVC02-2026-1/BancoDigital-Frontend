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
            <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white/80 p-4 backdrop-blur-md sm:gap-4 sm:p-6 lg:p-8">
                <button
                    onClick={onBack}
                    className="rounded-xl p-2.5 transition-all hover:bg-slate-100 sm:p-3"
                >
                    <ArrowLeft className="h-5 w-5 text-slate-600 sm:h-6 sm:w-6" />
                </button>
                <h1 className="text-xl font-black text-slate-900 sm:text-2xl italic uppercase tracking-tighter">
                    Mi Perfil
                </h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Avatar + Info Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="relative bg-linear-to-br from-blue-700 to-indigo-900 px-5 pt-6 pb-10 sm:px-10 sm:pt-10 sm:pb-16">
                            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-white/30 bg-white/10 shadow-xl sm:h-24 sm:w-24">
                                    <User className="h-10 w-10 text-white/60 sm:h-12 sm:w-12" />
                                </div>
                                <div className="min-w-0">
                                    <p className="break-words text-2xl font-black leading-tight text-white sm:text-3xl italic">
                                        {user?.name || 'Cliente'}
                                    </p>
                                    <p className="mt-1 break-all text-sm font-medium text-blue-200">
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
                        <div className="mx-4 mt-5 divide-y divide-slate-50 rounded-2xl border border-slate-100 bg-white shadow-sm sm:mx-6 sm:mt-6">
                            <div className="flex items-start gap-4 px-4 py-4 sm:items-center sm:px-6">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                                    <User className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Nombre
                                    </p>
                                    <p className="break-words font-bold text-slate-900">
                                        {user?.name || '—'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 px-4 py-4 sm:items-center sm:px-6">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                                    <Mail className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Correo electrónico
                                    </p>
                                    <p className="break-all font-bold text-slate-900">
                                        {user?.email || '—'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="h-6" />
                    </div>

                    {/* Security / Actions */}
                    <div className="space-y-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">
                            Seguridad
                        </h2>

                        <button
                            onClick={onChangePassword}
                            className="group flex w-full items-start gap-4 rounded-2xl p-4 text-left transition-all hover:bg-blue-50 sm:items-center"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 transition-all group-hover:bg-blue-600">
                                <KeyRound className="h-5 w-5 text-blue-600 transition-all group-hover:text-white" />
                            </div>
                            <div className="min-w-0">
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
                            className="group flex w-full items-start gap-4 rounded-2xl p-4 text-left transition-all hover:bg-red-50 sm:items-center"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 transition-all group-hover:bg-red-500">
                                <LogOut className="h-5 w-5 text-red-500 transition-all group-hover:text-white" />
                            </div>
                            <div className="min-w-0">
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
