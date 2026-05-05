import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, CheckCircle, AlertCircle, Wallet, Globe, Landmark, ChevronDown, UserPlus, Users, ShieldCheck, XCircle } from 'lucide-react';
import axios from 'axios';
import api from '../api/api';

interface TransfersProps {
    onBack: () => void;
}

interface BankAccount {
    id: number;
    accountNumber: string;
    type: string;
    balance: number;
}

interface ExternalAccount {
    id: number;
    accountNumber: string;
    holderName: string;
    bankName: string;
}

const Transfers: React.FC<TransfersProps> = ({ onBack }) => {
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [externalAccounts, setExternalAccounts] = useState<ExternalAccount[]>([]);
    const [fromAccount, setFromAccount] = useState('');
    const [toAccount, setToAccount] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showLinkedAccountsModal, setShowLinkedAccountsModal] = useState(false);
    const [linkData, setLinkData] = useState({ bankName: '', accountNumber: '', holderName: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [accRes, extRes] = await Promise.all([
                    api.get('/accounts/me'),
                    api.get('/external-accounts')
                ]);
                setAccounts(accRes.data);
                setExternalAccounts(extRes.data);
                if (accRes.data.length > 0) setFromAccount(accRes.data[0].accountNumber);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const fetchExternal = async () => {
        try {
            const res = await api.get('/external-accounts');
            setExternalAccounts(res.data);
        } catch(err) { console.error(err); }
    };

    const handleLinkBank = async () => {
        if (!linkData.bankName || !linkData.accountNumber || !linkData.holderName) {
            alert("Completa todos los campos");
            return;
        }
        try {
            await api.post('/external-accounts', linkData);
            setShowLinkModal(false);
            setLinkData({ bankName: '', accountNumber: '', holderName: '' });
            void fetchExternal();
        } catch { alert("Error al vincular"); }
    };

    const formatAccountNumber = (num: string) => {
        return num.replace(/(\d{4})/g, '$1 ').trim();
    };

    const selectedSourceAccount = accounts.find(account => account.accountNumber === fromAccount);
    const selectedDestinationAccount = accounts.find(account => account.accountNumber === toAccount);
    const selectedExternalAccount = externalAccounts.find(account => account.accountNumber === toAccount);
    const destinationOptions = accounts.filter(account => account.accountNumber !== fromAccount);
    const destinationLabel = selectedDestinationAccount
        ? (selectedDestinationAccount.type === 'SAVINGS' ? 'Cuenta de Ahorros' : 'Cuenta Corriente')
        : selectedExternalAccount?.holderName || 'Cuenta destino digitada';
    const destinationContext = selectedDestinationAccount
        ? 'BancoDigital'
        : selectedExternalAccount?.bankName || 'Transferencia manual';

    const parsedAmount = parseFloat(amount);
    const formattedAmount = !parsedAmount || parsedAmount <= 0
        ? '$0'
        : parsedAmount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });

    const openConfirmation = (e: React.FormEvent) => {
        e.preventDefault();

        if (!parsedAmount || parsedAmount <= 0) {
            setError('El monto debe ser mayor a cero');
            return;
        }

        if (!fromAccount || !toAccount) {
            setError('Completa la cuenta de origen y destino para continuar');
            return;
        }

        setError('');
        setShowConfirmation(true);
    };

    const handleTransfer = async () => {
        setLoading(true);
        setError('');

        try {
            await api.post('/transactions/transfer', {
                fromAccountNumber: fromAccount,
                toAccountNumber: toAccount,
                amount: parsedAmount,
                description: 'Transferencia BancoDigital'
            });
            setShowConfirmation(false);
            setSuccess(true);
        } catch (err: unknown) {
            if (axios.isAxiosError<string>(err)) {
                setError(err.response?.data || 'Error en la transferencia');
            } else {
                setError('Error en la transferencia');
            }
            setShowConfirmation(false);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-6 text-center animate-in zoom-in-95 duration-300 sm:p-12 sm:rounded-[3rem]">
                    <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-500 mx-auto mb-6 sm:h-24 sm:w-24 sm:rounded-4xl sm:mb-8">
                        <CheckCircle className="h-8 w-8 sm:h-12 sm:w-12" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-3 sm:text-3xl italic">¡Transferencia Exitosa!</h2>
                    <p className="text-slate-500 mb-8 font-medium sm:mb-10">El dinero ha sido enviado correctamente.</p>
                    <button onClick={onBack} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all sm:py-5">
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen flex flex-col bg-slate-50 overflow-hidden">
            <div className="sticky top-0 z-10 flex flex-col gap-4 border-b border-slate-200 bg-white/80 p-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:p-6 lg:p-8">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2.5 hover:bg-slate-100 rounded-xl transition-all sm:p-3">
                        <ArrowLeft className="h-5 w-5 text-slate-600 sm:h-6 sm:w-6" />
                    </button>
                    <h1 className="text-xl font-black text-slate-900 sm:text-2xl italic uppercase tracking-tighter">Enviar Dinero</h1>
                </div>
                <button 
                    onClick={() => setShowLinkModal(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-emerald-600 shadow-sm transition-all hover:bg-emerald-600 hover:text-white sm:w-auto sm:py-2"
                >
                    <UserPlus className="w-4 h-4" />
                    Vincular Nuevo
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-xl mx-auto py-4 sm:py-8 lg:py-10">
                    {error && (
                        <div className="mb-6 flex items-center gap-3 rounded-2xl border-2 border-red-100 bg-red-50 p-4 text-red-600 animate-in slide-in-from-top-4 sm:mb-8 sm:gap-4 sm:rounded-3xl sm:p-5">
                            <AlertCircle className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" />
                            <p className="text-sm font-black italic">{error}</p>
                        </div>
                    )}

                    <form onSubmit={openConfirmation} className="space-y-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-xl sm:space-y-8 sm:p-8 lg:p-10 lg:rounded-[3rem]">
                        {/* From Account */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-4">Origen de fondos</label>
                            <div className="relative">
                                <Wallet className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-600 sm:left-6" />
                                <select 
                                    className="w-full appearance-none rounded-2xl border-2 border-slate-50 bg-slate-50 py-4 pl-12 pr-10 text-sm font-black text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white sm:py-5 sm:pl-14 sm:pr-12"
                                    value={fromAccount}
                                    onChange={e => setFromAccount(e.target.value)}
                                    required
                                >
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.accountNumber}>
                                            {acc.type === 'SAVINGS' ? 'Ahorros' : 'Corriente'} ({formatAccountNumber(acc.accountNumber)}) — ${acc.balance.toLocaleString()}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 sm:right-6" />
                            </div>
                        </div>

                        {/* To Account */}
                        <div className="relative">
                            <div className="mb-3 flex items-center justify-between gap-3 px-2 sm:px-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cuenta destino</label>
                                <button 
                                    type="button"
                                    onClick={() => setShowLinkedAccountsModal(true)}
                                    className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                                >
                                    <Users className="w-3 h-3" />
                                    Mis vinculados
                                </button>
                            </div>
                            <input 
                                type="text"
                                placeholder="Número de 16 dígitos"
                                className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 font-mono text-base font-bold tracking-wide text-blue-700 outline-none transition-all focus:border-blue-600 focus:bg-white sm:px-8 sm:py-5 sm:text-lg sm:tracking-widest"
                                value={toAccount}
                                onChange={e => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                                    setToAccount(val);
                                }}
                                required
                            />
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-4">Monto a enviar</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300 sm:left-8 sm:text-2xl">$</span>
                                <input 
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="w-full rounded-3xl border-2 border-slate-50 bg-slate-50 py-5 pl-10 pr-5 text-3xl font-black tracking-tight text-blue-600 outline-none transition-all focus:border-blue-600 focus:bg-white sm:rounded-4xl sm:py-7 sm:pl-14 sm:pr-8 sm:text-5xl sm:tracking-tighter"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading || !toAccount || !amount}
                            className="mt-8 flex w-full items-center justify-center gap-3 rounded-3xl bg-blue-600 py-4 text-base font-black text-white shadow-2xl shadow-blue-200 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 sm:mt-10 sm:gap-4 sm:rounded-4xl sm:py-6 sm:text-lg"
                        >
                            <Send className="h-5 w-5 sm:h-6 sm:w-6" />
                            Revisar Transferencia
                        </button>
                    </form>
                </div>
            </div>

            {showConfirmation && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-60 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                    <div className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl animate-in zoom-in-95 duration-300 sm:p-8 lg:p-10 lg:rounded-[3rem]">
                        <div className="mb-6 flex items-start justify-between gap-4 sm:mb-8 sm:gap-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 sm:h-16 sm:w-16 sm:rounded-3xl">
                                    <ShieldCheck className="h-6 w-6 sm:h-8 sm:w-8" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Confirmación segura</p>
                                    <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl italic">Revisa antes de enviar</h2>
                                    <p className="mt-2 text-sm font-medium text-slate-400">Verifica los datos de la operación antes de ejecutarla.</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowConfirmation(false)}
                                disabled={loading}
                                className="group rounded-2xl p-3 text-slate-400 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 hover:text-slate-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                                title="Cerrar confirmación"
                            >
                                <XCircle className="h-6 w-6 transition-all duration-200 group-hover:scale-110 group-hover:rotate-6" />
                            </button>
                        </div>

                        <div className="mb-6 rounded-3xl border border-blue-100 bg-blue-50/40 px-5 py-5 sm:mb-8 sm:px-8 sm:py-7 lg:rounded-[2rem]">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Monto a transferir</p>
                            <p className="mt-3 break-words text-3xl font-black tracking-tight text-blue-600 sm:text-5xl sm:tracking-tighter">{formattedAmount}</p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 sm:p-6 lg:rounded-[2rem]">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Cuenta origen</p>
                                <p className="mt-4 text-lg font-black text-slate-900">
                                    {selectedSourceAccount?.type === 'SAVINGS' ? 'Cuenta de Ahorros' : 'Cuenta Corriente'}
                                </p>
                                <p className="mt-2 break-all font-mono text-xs font-bold tracking-widest text-slate-500 sm:text-sm">
                                    {formatAccountNumber(fromAccount)}
                                </p>
                            </div>

                            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 sm:p-6 lg:rounded-[2rem]">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Cuenta destino</p>
                                <p className="mt-4 text-lg font-black text-slate-900">
                                    {destinationLabel}
                                </p>
                                <p className="mt-2 break-all font-mono text-xs font-bold tracking-widest text-slate-500 sm:text-sm">
                                    {formatAccountNumber(toAccount)}
                                </p>
                                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">
                                    {destinationContext}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 rounded-[2rem] border border-amber-100 bg-amber-50 px-6 py-5">
                            <div className="flex items-start gap-3 text-amber-700">
                                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                                <p className="text-sm font-bold">
                                    Confirma solo si los datos del destinatario y el monto son correctos. Esta acción ejecutará la transferencia.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={() => setShowConfirmation(false)}
                                disabled={loading}
                                className="group flex flex-1 items-center justify-center gap-3 rounded-3xl py-5 font-black text-slate-400 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <XCircle className="h-5 w-5 transition-all duration-200 group-hover:scale-110 group-hover:-rotate-6" />
                                Cancelar operación
                            </button>
                            <button
                                type="button"
                                onClick={() => void handleTransfer()}
                                disabled={loading}
                                className="group flex flex-1 items-center justify-center gap-3 rounded-3xl bg-blue-600 py-5 font-black text-white shadow-xl shadow-blue-200 transition-all duration-200 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-300 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                            >
                                {!loading && <Send className="h-5 w-5 transition-all duration-200 group-hover:translate-x-1 group-hover:-translate-y-0.5" />}
                                {loading ? 'Procesando envío...' : 'Confirmar y enviar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showLinkedAccountsModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-60 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                    <div className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-300 lg:rounded-[3rem]">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6 sm:p-8">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Cuentas vinculadas</p>
                                <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl italic">Selecciona destino</h2>
                                <p className="mt-2 text-sm font-medium text-slate-400">Elige una cuenta guardada para completar el destino.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowLinkedAccountsModal(false)}
                                className="rounded-2xl p-3 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700"
                                title="Cerrar selección"
                            >
                                <XCircle className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="max-h-[55vh] overflow-y-auto p-5 sm:p-6">
                            {destinationOptions.length === 0 && externalAccounts.length === 0 ? (
                                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                                    <Landmark className="mx-auto mb-4 h-12 w-12 text-slate-200" />
                                    <p className="font-black text-slate-400 italic">No hay cuentas disponibles para seleccionar.</p>
                                    <p className="mt-2 text-sm font-medium text-slate-400">Puedes escribir una cuenta manualmente o vincular una nueva.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {destinationOptions.length > 0 && (
                                        <section>
                                            <p className="mb-3 px-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                                                Mis cuentas BancoDigital
                                            </p>
                                            <div className="space-y-3">
                                                {destinationOptions.map(account => (
                                                    <button
                                                        key={account.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setToAccount(account.accountNumber);
                                                            setShowLinkedAccountsModal(false);
                                                        }}
                                                        className={`w-full rounded-3xl border-2 p-4 text-left transition-all hover:border-blue-100 hover:bg-blue-50 ${
                                                            toAccount === account.accountNumber ? 'border-blue-600 bg-blue-50' : 'border-slate-100 bg-slate-50'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                                                                {account.type === 'SAVINGS' ? <Wallet className="h-6 w-6" /> : <Landmark className="h-6 w-6" />}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-sm font-black text-slate-900">
                                                                    {account.type === 'SAVINGS' ? 'Cuenta de Ahorros' : 'Cuenta Corriente'}
                                                                </p>
                                                                <p className="mt-1 break-all font-mono text-xs font-bold tracking-wider text-slate-500">
                                                                    {formatAccountNumber(account.accountNumber)}
                                                                </p>
                                                                <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-blue-600">
                                                                    Saldo: ${account.balance.toLocaleString()}
                                                                </p>
                                                            </div>
                                                            {toAccount === account.accountNumber && (
                                                                <CheckCircle className="h-5 w-5 shrink-0 text-blue-600" />
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {externalAccounts.length > 0 && (
                                        <section>
                                            <p className="mb-3 px-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                                                Cuentas vinculadas
                                            </p>
                                            <div className="space-y-3">
                                                {externalAccounts.map(ext => (
                                                    <button
                                                        key={ext.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setToAccount(ext.accountNumber);
                                                            setShowLinkedAccountsModal(false);
                                                        }}
                                                        className={`w-full rounded-3xl border-2 p-4 text-left transition-all hover:border-blue-100 hover:bg-blue-50 ${
                                                            toAccount === ext.accountNumber ? 'border-blue-600 bg-blue-50' : 'border-slate-100 bg-slate-50'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                                                                <Landmark className="h-6 w-6" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-sm font-black text-slate-900">{ext.holderName}</p>
                                                                <p className="mt-1 break-all font-mono text-xs font-bold tracking-wider text-slate-500">
                                                                    {formatAccountNumber(ext.accountNumber)}
                                                                </p>
                                                                <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-emerald-600">{ext.bankName}</p>
                                                            </div>
                                                            {toAccount === ext.accountNumber && (
                                                                <CheckCircle className="h-5 w-5 shrink-0 text-blue-600" />
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Link Modal */}
            {showLinkModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-60 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                    <div className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-300 sm:p-10 lg:rounded-[3rem]">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 mx-auto mb-4 sm:h-20 sm:w-20 sm:rounded-4xl">
                                <Globe className="h-8 w-8 sm:h-10 sm:w-10" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 sm:text-3xl italic">Vincular Banco</h3>
                            <p className="text-slate-400 font-medium mt-1">Añade un favorito para transferir</p>
                        </div>
                        <div className="space-y-4 mb-8 sm:mb-10">
                            <input 
                                placeholder="Nombre Entidad (Bancolombia, etc.)"
                                className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-emerald-500 outline-none font-bold italic"
                                value={linkData.bankName}
                                onChange={e => setLinkData({...linkData, bankName: e.target.value})}
                            />
                            <input 
                                placeholder="Número de Cuenta (16 dígitos)"
                                className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-emerald-500 outline-none font-mono font-bold"
                                value={linkData.accountNumber}
                                onChange={e => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                                    setLinkData({...linkData, accountNumber: val});
                                }}
                            />
                            <input 
                                placeholder="Nombre del Titular"
                                className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-emerald-500 outline-none font-bold italic"
                                value={linkData.holderName}
                                onChange={e => setLinkData({...linkData, holderName: e.target.value})}
                            />
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                            <button onClick={() => setShowLinkModal(false)} className="flex-1 py-5 text-slate-400 font-black hover:bg-slate-50 rounded-3xl transition-all">Cancelar</button>
                            <button onClick={handleLinkBank} className="flex-2 bg-emerald-600 text-white py-5 rounded-3xl font-black shadow-xl shadow-emerald-200 transition-all active:scale-95">Vincular Ahora</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transfers;
