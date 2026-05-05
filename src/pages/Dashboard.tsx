import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, CreditCard, Home, LogOut, Receipt, Settings, TrendingUp, User, Wallet, Plus, Globe, Landmark, Coins, Trash2, RefreshCcw, AlertCircle, Menu, X } from 'lucide-react';
import axios from 'axios';
import api from '../api/api';
import VirtualCard from '../components/VirtualCard';

interface DashboardProps {
    user?: DashboardUser;
    onLogout: () => void;
    onNavigate: (view: DashboardView) => void;
}

type DashboardView = 'DASHBOARD' | 'TRANSFERS' | 'MOVEMENTS' | 'PROFILE';

interface DashboardUser {
    name?: string;
    selfie?: string;
}

interface BankAccount {
    id: number;
    type: string;
    accountNumber: string;
    balance?: number;
}

interface ExternalAccount {
    id: number;
    bankName: string;
    accountNumber: string;
    holderName: string;
}


const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onNavigate }): React.ReactElement => {
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [externalAccounts, setExternalAccounts] = useState<ExternalAccount[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
    const [showCard, setShowCard] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [newAccountType, setNewAccountType] = useState('SAVINGS');
    const [linkData, setLinkData] = useState({ bankName: '', accountNumber: '', holderName: '' });
    const [showBalances, setShowBalances] = useState<Record<number, boolean>>({});
    const [initialLoading, setInitialLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [accountsError, setAccountsError] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState<ExternalAccount | null>(null);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const isFetchingRef = useRef(false);
    const hasLoadedRef = useRef(false);
    const isMountedRef = useRef(false);

    const selfieUrl = user?.selfie ? `http://localhost:8081/uploads/${encodeURIComponent(user.selfie)}` : null;
    const [selfieFailed, setSelfieFailed] = useState(false);

    const fetchData = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
        if (isFetchingRef.current) {
            return;
        }

        isFetchingRef.current = true;

        if (hasLoadedRef.current && !silent) {
            setRefreshing(true);
        }

        try {
            const [accRes, extRes] = await Promise.all([
                api.get<BankAccount[]>('/accounts/me'),
                api.get<ExternalAccount[]>('/external-accounts')
            ]);

            if (!isMountedRef.current) {
                return;
            }

            setAccounts(accRes.data);
            setExternalAccounts(extRes.data);
            setAccountsError('');
        } catch (err) {
            console.error("Error fetching data", err);

            if (!isMountedRef.current) {
                return;
            }

            if (!navigator.onLine) {
                setAccountsError('No se puede obtener el saldo porque no hay conexión a internet.');
                return;
            }

            if (axios.isAxiosError(err) && !err.response) {
                setAccountsError('No se pudo conectar con el servicio para consultar el saldo.');
                return;
            }

            setAccountsError('No fue posible consultar tu saldo en este momento. Intenta nuevamente.');
        } finally {
            isFetchingRef.current = false;

            if (isMountedRef.current) {
                hasLoadedRef.current = true;
                setInitialLoading(false);
                setRefreshing(false);
            }
        }
    }, []);

    const formatAccountNumber = (num: string) => {
        return num.replace(/(\d{4})/g, '$1 ').trim();
    };

    useEffect(() => {
        isMountedRef.current = true;
        void fetchData();

        return () => {
            isMountedRef.current = false;
        };
    }, [fetchData]);

    const handleCreateAccount = async () => {
        try {
            await api.post('/accounts/create', { type: newAccountType });
            setShowCreateModal(false);
            void fetchData({ silent: true });
        } catch {
            alert("Error al crear la cuenta");
        }
    };

    const handleLinkBank = async () => {
        if (!linkData.bankName || !linkData.accountNumber || !linkData.holderName) {
            alert("Por favor completa todos los campos");
            return;
        }
        try {
            await api.post('/external-accounts', linkData);
            setShowLinkModal(false);
            setLinkData({ bankName: '', accountNumber: '', holderName: '' });
            void fetchData({ silent: true });
            alert("Banco vinculado con éxito");
        } catch {
            alert("Error al vincular el banco");
        }
    };

    const handleDeleteExternal = (account: ExternalAccount) => {
        setAccountToDelete(account);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!accountToDelete) return;
        try {
            await api.delete(`/external-accounts/${accountToDelete.id}`);
            setShowDeleteModal(false);
            setAccountToDelete(null);
            void fetchData({ silent: true });
            // Optional: Success toast could go here
        } catch {
            alert("Error al eliminar la cuenta");
        }
    };

    const toggleBalance = (id: number) => {
        setShowBalances(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleNavigate = (view: DashboardView) => {
        setShowMobileMenu(false);
        onNavigate(view);
    };

    const handleMobileLogout = () => {
        setShowMobileMenu(false);
        onLogout();
    };

    return (
        <div className="w-screen h-screen flex flex-col bg-slate-50 overflow-hidden lg:flex-row">
            {/* Mobile Header */}
            <div className="z-20 flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm lg:hidden">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-700 shadow-lg shadow-blue-200">
                        <Wallet className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl font-black tracking-tight text-slate-900">BancoDigital</span>
                </div>
                <button
                    type="button"
                    onClick={() => setShowMobileMenu(true)}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-slate-600 transition-all hover:bg-blue-50 hover:text-blue-600"
                    title="Abrir menú"
                >
                    <Menu className="h-6 w-6" />
                </button>
            </div>

            {/* Sidebar */}
            <div className="z-10 hidden w-72 shrink-0 flex-col border-r border-slate-200 bg-white shadow-sm lg:flex">
                <div className="border-b border-slate-100 p-4 lg:mb-6 lg:p-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-700 shadow-lg shadow-blue-200 lg:h-12 lg:w-12">
                            <Wallet className="h-6 w-6 text-white lg:h-7 lg:w-7" />
                        </div>
                        <span className="text-xl font-black tracking-tight text-slate-900 lg:text-2xl">BancoDigital</span>
                    </div>
                </div>
                
                <nav className="flex-1 px-4 space-y-2">
                    <button onClick={() => handleNavigate('DASHBOARD')} className="flex w-full items-center gap-4 rounded-2xl bg-blue-600 px-5 py-4 font-bold text-white shadow-md transition-all">
                        <Home className="w-5 h-5" />
                        <span>Inicio</span>
                    </button>
                    <button onClick={() => handleNavigate('TRANSFERS')} className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 font-semibold text-slate-500 transition-all hover:bg-slate-50 hover:text-blue-600">
                        <ArrowUpRight className="w-5 h-5" />
                        <span>Transferencias</span>
                    </button>
                    <button onClick={() => handleNavigate('MOVEMENTS')} className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 font-semibold text-slate-500 transition-all hover:bg-slate-50 hover:text-blue-600">
                        <Receipt className="w-5 h-5" />
                        <span>Movimientos</span>
                    </button>
                    <button className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 font-semibold text-slate-500 transition-all hover:bg-slate-50 hover:text-blue-600">
                        <TrendingUp className="w-5 h-5" />
                        <span>Inversiones</span>
                    </button>
                    <button className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 font-semibold text-slate-500 transition-all hover:bg-slate-50 hover:text-blue-600">
                        <Settings className="w-5 h-5" />
                        <span>Configuración</span>
                    </button>
                </nav>

                <div className="border-t border-slate-100 bg-slate-50/50 p-6">
                    <button
                        onClick={() => handleNavigate('PROFILE')}
                        className="flex w-full items-center gap-4 -mx-2 mb-6 rounded-2xl p-2 text-left transition-all hover:bg-slate-100"
                        title="Ver perfil"
                    >
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-sm border border-slate-200 group-hover:border-blue-200 transition-all shrink-0">
                            {selfieUrl && !selfieFailed ? (
                                <img
                                    src={selfieUrl}
                                    alt="Selfie"
                                    className="w-full h-full object-cover"
                                    onError={() => setSelfieFailed(true)}
                                />
                            ) : (
                                <User className="w-6 h-6 text-blue-600" />
                            )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-slate-900 text-sm font-bold truncate group-hover:text-blue-600 transition-colors">{user?.name || 'Cliente'}</p>
                            <p className="text-slate-400 text-xs font-medium">Ver perfil</p>
                        </div>
                    </button>
                    <button 
                        onClick={onLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-4 py-3 text-sm font-bold text-red-500 shadow-sm transition-all hover:bg-red-50 active:scale-95"
                    >
                        <LogOut className="w-4 h-4" />
                        Cerrar sesión
                    </button>
                </div>
            </div>

            {showMobileMenu && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 p-4 backdrop-blur-md lg:hidden">
                    <div className="flex max-h-full w-full flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-700 shadow-lg shadow-blue-200">
                                    <Wallet className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-xl font-black tracking-tight text-slate-900">BancoDigital</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowMobileMenu(false)}
                                className="rounded-2xl p-3 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700"
                                title="Cerrar menú"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5">
                            <nav className="space-y-2">
                                <button onClick={() => handleNavigate('DASHBOARD')} className="flex w-full items-center gap-4 rounded-2xl bg-blue-600 px-5 py-4 font-bold text-white shadow-md transition-all">
                                    <Home className="h-5 w-5" />
                                    <span>Inicio</span>
                                </button>
                                <button onClick={() => handleNavigate('TRANSFERS')} className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 font-semibold text-slate-500 transition-all hover:bg-slate-50 hover:text-blue-600">
                                    <ArrowUpRight className="h-5 w-5" />
                                    <span>Transferencias</span>
                                </button>
                                <button onClick={() => handleNavigate('MOVEMENTS')} className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 font-semibold text-slate-500 transition-all hover:bg-slate-50 hover:text-blue-600">
                                    <Receipt className="h-5 w-5" />
                                    <span>Movimientos</span>
                                </button>
                                <button className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 font-semibold text-slate-500 transition-all hover:bg-slate-50 hover:text-blue-600">
                                    <TrendingUp className="h-5 w-5" />
                                    <span>Inversiones</span>
                                </button>
                                <button className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 font-semibold text-slate-500 transition-all hover:bg-slate-50 hover:text-blue-600">
                                    <Settings className="h-5 w-5" />
                                    <span>Configuración</span>
                                </button>
                            </nav>
                        </div>

                        <div className="border-t border-slate-100 bg-slate-50/50 p-5">
                            <button
                                onClick={() => handleNavigate('PROFILE')}
                                className="mb-4 flex w-full items-center gap-4 rounded-2xl p-2 text-left transition-all hover:bg-slate-100"
                                title="Ver perfil"
                            >
                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white flex items-center justify-center shadow-sm">
                                    {selfieUrl && !selfieFailed ? (
                                        <img
                                            src={selfieUrl}
                                            alt="Selfie"
                                            className="h-full w-full object-cover"
                                            onError={() => setSelfieFailed(true)}
                                        />
                                    ) : (
                                        <User className="h-6 w-6 text-blue-600" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-bold text-slate-900">{user?.name || 'Cliente'}</p>
                                    <p className="text-xs font-medium text-slate-400">Ver perfil</p>
                                </div>
                            </button>
                            <button
                                onClick={handleMobileLogout}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-4 py-3 text-sm font-bold text-red-500 shadow-sm transition-all hover:bg-red-50 active:scale-95"
                            >
                                <LogOut className="h-4 w-4" />
                                Cerrar sesión
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-auto bg-[#F8FAFC]">
                <div className="px-4 py-6 sm:px-6 lg:px-12 lg:py-10">
                    <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between lg:mb-12">
                        <div className="min-w-0">
                            <h1 className="mb-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl italic">¡Bienvenido, <span className="text-blue-700">{user?.name?.split(' ')[0] || 'Cliente'}!</span></h1>
                            <p className="text-base font-medium text-slate-400 sm:text-lg">Gestiona tus finanzas y expande tu capital hoy.</p>
                        </div>
                        <button 
                            onClick={() => void fetchData()}
                            className="self-start rounded-3xl border border-slate-100 bg-white p-4 text-slate-400 shadow-sm transition-all hover:text-blue-600 hover:shadow-lg sm:p-5 group"
                            title="Actualizar saldos"
                        >
                            <RefreshCcw className={`w-6 h-6 group-hover:rotate-180 transition-all duration-500 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {accountsError && (
                        <div className="mb-8 flex flex-col items-start justify-between gap-4 rounded-[2rem] border border-red-100 bg-red-50 px-5 py-5 text-red-600 sm:flex-row sm:px-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                                <div>
                                    <p className="text-sm font-black uppercase tracking-widest">Consulta de saldo no disponible</p>
                                    <p className="mt-1 text-sm font-medium">{accountsError}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => void fetchData()}
                                className="shrink-0 rounded-2xl bg-white px-4 py-3 text-xs font-black uppercase tracking-widest text-red-600 shadow-sm transition-all hover:bg-red-600 hover:text-white"
                            >
                                Reintentar
                            </button>
                        </div>
                    )}

                    {/* Action Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        <button 
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-xl hover:shadow-blue-200/20 sm:gap-6 sm:p-8 group lg:rounded-[2.5rem]"
                        >
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 transition-all group-hover:bg-blue-600 group-hover:text-white sm:h-16 sm:w-16">
                                <Plus className="h-7 w-7 sm:h-8 sm:w-8" />
                            </div>
                            <div className="min-w-0 text-left">
                                <p className="mb-1 text-lg font-black text-slate-900 sm:text-xl italic">Abrir Nueva Cuenta</p>
                                <p className="text-slate-400 text-sm font-medium">Ahorros o Corriente instantánea</p>
                            </div>
                        </button>
                        <button 
                            onClick={() => setShowLinkModal(true)}
                            className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-xl hover:shadow-emerald-200/20 sm:gap-6 sm:p-8 group lg:rounded-[2.5rem]"
                        >
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 transition-all group-hover:bg-emerald-600 group-hover:text-white sm:h-16 sm:w-16">
                                <Globe className="h-7 w-7 sm:h-8 sm:w-8" />
                            </div>
                            <div className="min-w-0 text-left">
                                <p className="mb-1 text-lg font-black text-slate-900 sm:text-xl italic">Vincular Banco</p>
                                <p className="text-slate-400 text-sm font-medium">Asocia Bancolombia, Nequi y más</p>
                            </div>
                        </button>
                    </div>

                    {/* Accounts List */}
                    <div className="space-y-4 mb-20">
                        <div className="flex items-center justify-between px-2 mb-4">
                            <h2 className="text-xl font-black text-slate-900 italic uppercase">Mis Cuentas</h2>
                            <span className="text-xs bg-slate-100 text-slate-400 px-3 py-1 rounded-full font-bold uppercase tracking-widest">{accounts.length} Activas</span>
                        </div>
                        {initialLoading ? (
                            <div className="text-center py-10 text-slate-400 font-bold animate-pulse italic">Sincronizando cuentas...</div>
                        ) : accounts.length === 0 ? (
                            <div className="bg-white p-10 rounded-[2.5rem] border border-dashed border-slate-200 text-center">
                                <Coins className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold italic">No tienes cuentas activas aún.</p>
                            </div>
                        ) : (
                            accounts.map((acc) => (
                                <div key={acc.id} className="flex flex-col gap-5 rounded-3xl border border-slate-50 bg-white p-5 shadow-sm transition-all hover:border-blue-100 sm:flex-row sm:items-center sm:justify-between sm:p-6 group lg:rounded-4xl">
                                    <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all group-hover:bg-blue-50 group-hover:text-blue-500 sm:h-16 sm:w-16">
                                            {acc.type === 'SAVINGS' ? <TrendingUp className="h-7 w-7 sm:h-8 sm:w-8" /> : <Landmark className="h-7 w-7 sm:h-8 sm:w-8" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-slate-900 font-black text-lg mb-1">{acc.type === 'SAVINGS' ? 'Cuenta de Ahorros' : 'Cuenta Corriente'}</p>
                                            <p className="break-all font-mono text-xs font-medium tracking-wider text-slate-400 sm:text-sm">{formatAccountNumber(acc.accountNumber)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-4 sm:justify-end sm:gap-6 sm:text-right">
                                        <div className="min-w-0">
                                            <p className="text-xl font-black tracking-tighter text-slate-900 sm:text-2xl">
                                                {showBalances[acc.id] ? `$${acc.balance?.toLocaleString()}` : '••••••••'}
                                            </p>
                                            <button onClick={() => toggleBalance(acc.id)} className="text-[10px] text-blue-600 font-bold uppercase tracking-widest hover:underline">
                                                {showBalances[acc.id] ? 'Ocultar Saldo' : 'Mostrar Saldo'}
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                setSelectedAccount(acc);
                                                setShowCard(true);
                                            }}
                                            className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                        >
                                            <CreditCard className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Bancos Vinculados */}
                    <div className="space-y-4 mb-20">
                        <div className="flex items-center justify-between px-2 mb-4">
                            <h2 className="text-xl font-black text-slate-900 italic uppercase">Bancos Vinculados</h2>
                            <span className="text-xs bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full font-bold uppercase tracking-widest">{externalAccounts.length} Conectados</span>
                        </div>
                        {externalAccounts.length === 0 ? (
                            <div className="bg-white p-10 rounded-[2.5rem] border border-dashed border-slate-200 text-center">
                                <Globe className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold italic">No has vinculado bancos externos aún.</p>
                            </div>
                        ) : (
                            externalAccounts.map((ext) => (
                                <div key={ext.id} className="flex flex-col gap-5 rounded-3xl border border-slate-50 bg-white p-5 shadow-sm transition-all hover:border-emerald-100 sm:flex-row sm:items-center sm:justify-between sm:p-6 group lg:rounded-4xl">
                                    <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-all sm:h-16 sm:w-16">
                                            <Landmark className="h-7 w-7 sm:h-8 sm:w-8" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-slate-900 font-black text-lg mb-1">{ext.bankName}</p>
                                            <p className="break-all font-mono text-xs font-medium tracking-wider text-slate-400 sm:text-sm">{formatAccountNumber(ext.accountNumber)}</p>
                                            <p className="mt-1 break-words text-[10px] font-bold uppercase tracking-widest text-slate-300">Titular: {ext.holderName}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteExternal(ext)}
                                        className="self-end rounded-2xl bg-slate-50 p-4 text-slate-300 shadow-sm transition-all hover:bg-red-50 hover:text-red-500 sm:self-auto"
                                        title="Desvincular cuenta"
                                    >
                                        <Trash2 className="w-6 h-6" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* New Account Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-60 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                    <div className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-300 sm:p-10 lg:rounded-[3rem]">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mx-auto mb-4 sm:h-20 sm:w-20 sm:rounded-4xl">
                                <Plus className="h-8 w-8 sm:h-10 sm:w-10" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 sm:text-3xl italic">Nueva Cuenta</h3>
                            <p className="text-slate-400 font-medium mt-1">Elige el tipo de portafolio</p>
                        </div>
                        <div className="space-y-4 mb-8 sm:mb-10">
                            <button 
                                onClick={() => setNewAccountType('SAVINGS')}
                                className={`w-full rounded-3xl border-4 p-5 transition-all flex items-center justify-between text-left sm:p-6 lg:rounded-4xl ${newAccountType === 'SAVINGS' ? 'border-blue-600 bg-blue-50/20' : 'border-slate-50 hover:border-slate-100'}`}
                            >
                                <div>
                                    <p className="font-black text-slate-900 text-lg">Ahorros</p>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Rentabilidad 12% E.A.</p>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-4 ${newAccountType === 'SAVINGS' ? 'border-blue-600 bg-white' : 'border-slate-200'}`} />
                            </button>
                            <button 
                                onClick={() => setNewAccountType('CHECKING')}
                                className={`w-full rounded-3xl border-4 p-5 transition-all flex items-center justify-between text-left sm:p-6 lg:rounded-4xl ${newAccountType === 'CHECKING' ? 'border-blue-600 bg-blue-50/20' : 'border-slate-50 hover:border-slate-100'}`}
                            >
                                <div>
                                    <p className="font-black text-slate-900 text-lg">Corriente</p>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Sobregiro de $1M</p>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-4 ${newAccountType === 'CHECKING' ? 'border-blue-600 bg-white' : 'border-slate-200'}`} />
                            </button>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                            <button onClick={() => setShowCreateModal(false)} className="flex-1 py-5 text-slate-400 font-black hover:bg-slate-50 rounded-3xl transition-all">Cancelar</button>
                            <button onClick={handleCreateAccount} className="flex-2 bg-blue-600 text-white py-5 rounded-3xl font-black shadow-xl shadow-blue-200 active:scale-95 transition-all">Confirmar Apertura</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Link Bank Modal */}
            {showLinkModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-60 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                    <div className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-300 sm:p-10 lg:rounded-[3rem]">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 mx-auto mb-4 sm:h-20 sm:w-20 sm:rounded-4xl">
                                <Globe className="h-8 w-8 sm:h-10 sm:w-10" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 sm:text-3xl italic">Vincular Banco</h3>
                            <p className="text-slate-400 font-medium mt-1">Conecta tus entidades externas</p>
                        </div>
                        <div className="space-y-4 mb-8 sm:mb-10">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Nombre de Entidad</label>
                                <input 
                                    placeholder="Nequi, Bancolombia..."
                                    className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-emerald-500 focus:bg-white transition-all outline-none font-bold italic"
                                    value={linkData.bankName}
                                    onChange={e => setLinkData({...linkData, bankName: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Número de Cuenta</label>
                                <input 
                                    placeholder="0000 0000 0000 0000"
                                    className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-emerald-500 focus:bg-white transition-all outline-none font-mono font-bold"
                                    value={linkData.accountNumber}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                                        setLinkData({...linkData, accountNumber: val});
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Nombre del Titular</label>
                                <input 
                                    placeholder="Como aparece en el banco"
                                    className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-emerald-500 focus:bg-white transition-all outline-none font-bold italic"
                                    value={linkData.holderName}
                                    onChange={e => setLinkData({...linkData, holderName: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                            <button onClick={() => setShowLinkModal(false)} className="flex-1 py-5 text-slate-400 font-black hover:bg-slate-50 rounded-3xl transition-all">Cancelar</button>
                            <button onClick={handleLinkBank} className="flex-2 bg-emerald-600 text-white py-5 rounded-3xl font-black shadow-xl shadow-emerald-200 active:scale-95 transition-all">Vincular Ahora</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Virtual Card Overlay */}
            {showCard && selectedAccount && (
                <VirtualCard 
                    accountNumber={selectedAccount.accountNumber}
                    holderName={user?.name || 'Cliente'}
                    type={selectedAccount.type}
                    onClose={() => setShowCard(false)}
                />
            )}

            {/* Custom Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-70 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                    <div className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 text-center shadow-2xl animate-in zoom-in-95 duration-300 sm:p-10 lg:rounded-[3rem]">
                        <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-6 sm:h-20 sm:w-20 sm:rounded-4xl">
                            <Trash2 className="h-8 w-8 sm:h-10 sm:w-10" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 sm:text-3xl italic mb-2">¿Desvincular Banco?</h3>
                        <p className="text-slate-400 font-medium mb-8">
                            Estás a punto de desvincular la cuenta de <span className="text-slate-900 font-bold">{accountToDelete?.bankName}</span>. 
                            No podrás realizar transferencias a ella hasta que la vincules de nuevo.
                        </p>
                        
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={confirmDelete}
                                className="w-full bg-red-500 text-white py-5 rounded-3xl font-black shadow-xl shadow-red-200 active:scale-95 transition-all text-lg"
                            >
                                Sí, desvincular ahora
                            </button>
                            <button 
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setAccountToDelete(null);
                                }} 
                                className="w-full py-5 text-slate-400 font-black hover:bg-slate-50 rounded-3xl transition-all"
                            >
                                No, mantener cuenta
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
