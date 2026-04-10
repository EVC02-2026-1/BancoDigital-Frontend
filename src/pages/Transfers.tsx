import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, CheckCircle, AlertCircle, Wallet, Globe, Landmark, ChevronDown, UserPlus, Users } from 'lucide-react';
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
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showSelection, setShowSelection] = useState(false);
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

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        const parsedAmount = parseFloat(amount);
        if (!parsedAmount || parsedAmount <= 0) {
            setError('El monto debe ser mayor a cero');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await api.post('/transactions/transfer', {
                fromAccountNumber: fromAccount,
                toAccountNumber: toAccount,
                amount: parsedAmount,
                description: 'Transferencia BancoDigital'
            });
            setSuccess(true);
        } catch (err: unknown) {
            if (axios.isAxiosError<string>(err)) {
                setError(err.response?.data || 'Error en la transferencia');
            } else {
                setError('Error en la transferencia');
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-slate-50 p-6">
                <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center animate-in zoom-in-95 duration-300">
                    <div className="w-24 h-24 bg-emerald-50 rounded-4xl flex items-center justify-center text-emerald-500 mx-auto mb-8">
                        <CheckCircle className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-3 italic">¡Transferencia Exitosa!</h2>
                    <p className="text-slate-500 mb-10 font-medium">El dinero ha sido enviado correctamente.</p>
                    <button onClick={onBack} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all">
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen flex flex-col bg-slate-50 overflow-hidden">
            <div className="p-8 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-3 hover:bg-slate-100 rounded-xl transition-all">
                        <ArrowLeft className="w-6 h-6 text-slate-600" />
                    </button>
                    <h1 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">Enviar Dinero</h1>
                </div>
                <button 
                    onClick={() => setShowLinkModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                >
                    <UserPlus className="w-4 h-4" />
                    Vincular Nuevo
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-xl mx-auto py-10">
                    {error && (
                        <div className="mb-8 p-5 bg-red-50 border-2 border-red-100 text-red-600 rounded-3xl flex items-center gap-4 animate-in slide-in-from-top-4">
                            <AlertCircle className="w-6 h-6 shrink-0" />
                            <p className="text-sm font-black italic">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleTransfer} className="space-y-8 bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                        {/* From Account */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-4">Origen de fondos</label>
                            <div className="relative">
                                <Wallet className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
                                <select 
                                    className="w-full pl-14 pr-12 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-black text-slate-900 appearance-none cursor-pointer"
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
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* To Account */}
                        <div className="relative">
                            <div className="flex items-center justify-between mb-3 px-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cuenta destino</label>
                                <button 
                                    type="button"
                                    onClick={() => setShowSelection(!showSelection)}
                                    className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                                >
                                    <Users className="w-3 h-3" />
                                    {showSelection ? 'Escribir número' : 'Mis vinculados'}
                                </button>
                            </div>
                            {showSelection ? (
                                <div className="space-y-2">
                                    {externalAccounts.length === 0 ? (
                                        <p className="text-center py-4 bg-slate-50 rounded-2xl text-xs font-bold text-slate-400 italic">No tienes cuentas vinculadas.</p>
                                    ) : (
                                        externalAccounts.map(ext => (
                                            <button
                                                key={ext.id}
                                                type="button"
                                                onClick={() => {
                                                    setToAccount(ext.accountNumber);
                                                    setShowSelection(false);
                                                }}
                                                className="w-full p-4 bg-slate-50 hover:bg-blue-50 border-2 border-transparent hover:border-blue-100 rounded-2xl transition-all flex items-center justify-between group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 shadow-sm">
                                                        <Landmark className="w-5 h-5" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-black text-slate-900 text-sm">{ext.holderName}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{ext.bankName} • {formatAccountNumber(ext.accountNumber)}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            ) : (
                                <input 
                                    type="text"
                                    placeholder="Número de 16 dígitos"
                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-mono font-bold text-lg tracking-widest text-blue-700"
                                    value={toAccount}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                                        setToAccount(val);
                                    }}
                                    required
                                />
                            )}
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-4">Monto a enviar</label>
                            <div className="relative">
                                <span className="absolute left-8 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">$</span>
                                <input 
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="w-full pl-14 pr-8 py-7 bg-slate-50 border-2 border-slate-50 rounded-4xl focus:border-blue-600 focus:bg-white outline-none transition-all font-black text-5xl text-blue-600 tracking-tighter"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading || !toAccount || !amount}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-4xl py-6 transition-all shadow-2xl shadow-blue-200 text-lg font-black flex items-center justify-center gap-4 active:scale-[0.98] mt-10"
                        >
                            <Send className="w-6 h-6" />
                            {loading ? 'Procesando Envío...' : 'Confirmar Transferencia'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Link Modal */}
            {showLinkModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-60 flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-emerald-50 rounded-4xl flex items-center justify-center text-emerald-600 mx-auto mb-4">
                                <Globe className="w-10 h-10" />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 italic">Vincular Banco</h3>
                            <p className="text-slate-400 font-medium mt-1">Añade un favorito para transferir</p>
                        </div>
                        <div className="space-y-4 mb-10">
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
                        <div className="flex gap-4">
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
