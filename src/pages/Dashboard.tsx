import React, { useState, useEffect } from 'react';
import { ArrowUpRight, CreditCard, Home, LogOut, Receipt, Settings, TrendingUp, User, Wallet, Plus, Globe, Landmark, Coins, Trash2, RefreshCcw } from 'lucide-react';
import api from '../api/api';
import VirtualCard from '../components/VirtualCard';

interface DashboardProps {
    user: any;
    onLogout: () => void;
    onNavigate: (view: any) => void;
}


const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onNavigate }): React.ReactElement => {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [externalAccounts, setExternalAccounts] = useState<any[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<any>(null);
    const [showCard, setShowCard] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [newAccountType, setNewAccountType] = useState('SAVINGS');
    const [linkData, setLinkData] = useState({ bankName: '', accountNumber: '', holderName: '' });
    const [showBalances, setShowBalances] = useState<Record<number, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState<any>(null);

    const selfieUrl = user?.selfie ? `http://localhost:8081/uploads/${encodeURIComponent(user.selfie)}` : null;

    const fetchData = async () => {
        setLoading(true);
        try {
            const [accRes, extRes] = await Promise.all([
                api.get('/accounts/me'),
                api.get('/external-accounts')
            ]);
            setAccounts(accRes.data);
            setExternalAccounts(extRes.data);
        } catch (err) {
            console.error("Error fetching data", err);
        } finally {
            setLoading(false);
        }
    };

    const formatAccountNumber = (num: string) => {
        return num.replace(/(\d{4})/g, '$1 ').trim();
    };

    useEffect(() => {
        fetchData();
        // Polling para mantener saldos actualizados ante cambios externos (terminal, etc)
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleCreateAccount = async () => {
        try {
            await api.post('/accounts/create', { type: newAccountType });
            setShowCreateModal(false);
            fetchData();
        } catch (err) {
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
            fetchData();
            alert("Banco vinculado con éxito");
        } catch (err) {
            alert("Error al vincular el banco");
        }
    };

    const handleDeleteExternal = (account: any) => {
        setAccountToDelete(account);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!accountToDelete) return;
        try {
            await api.delete(`/external-accounts/${accountToDelete.id}`);
            setShowDeleteModal(false);
            setAccountToDelete(null);
            fetchData();
            // Optional: Success toast could go here
        } catch (err) {
            alert("Error al eliminar la cuenta");
        }
    };

    const toggleBalance = (id: number) => {
        setShowBalances(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="w-screen h-screen flex bg-slate-50 overflow-hidden">
            {/* Sidebar */}
            <div className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
                <div className="p-8 border-b border-slate-100 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                            <Wallet className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-slate-900 text-2xl font-black tracking-tight">BancoDigital</span>
                    </div>
                </div>
                
                <nav className="flex-1 px-4 space-y-2">
                    <button onClick={() => onNavigate('DASHBOARD')} className="w-full flex items-center gap-4 px-5 py-4 bg-blue-600 text-white rounded-2xl shadow-md transition-all font-bold">
                        <Home className="w-5 h-5" />
                        <span>Inicio</span>
                    </button>
                    <button onClick={() => onNavigate('TRANSFERS')} className="w-full flex items-center gap-4 px-5 py-4 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-2xl transition-all font-semibold">
                        <ArrowUpRight className="w-5 h-5" />
                        <span>Transferencias</span>
                    </button>
                    <button onClick={() => onNavigate('MOVEMENTS')} className="w-full flex items-center gap-4 px-5 py-4 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-2xl transition-all font-semibold">
                        <Receipt className="w-5 h-5" />
                        <span>Movimientos</span>
                    </button>
                    <button className="w-full flex items-center gap-4 px-5 py-4 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-2xl transition-all font-semibold">
                        <TrendingUp className="w-5 h-5" />
                        <span>Inversiones</span>
                    </button>
                    <button className="w-full flex items-center gap-4 px-5 py-4 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-2xl transition-all font-semibold">
                        <Settings className="w-5 h-5" />
                        <span>Configuración</span>
                    </button>
                </nav>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-sm border border-slate-200">
                            {selfieUrl ? (
                                <img 
                                    src={selfieUrl} 
                                    alt="Selfie" 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>';
                                    }}
                                />
                            ) : (
                                <User className="w-6 h-6 text-blue-600" />
                            )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-slate-900 text-sm font-bold truncate">{user?.name || 'Cliente'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-red-500 border border-red-100 rounded-xl hover:bg-red-50 transition-all text-sm font-bold shadow-sm active:scale-95"
                    >
                        <LogOut className="w-4 h-4" />
                        Cerrar sesión
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto bg-[#F8FAFC]">
                <div className="px-12 py-10">
                    <div className="mb-12 flex items-center justify-between">
                        <div>
                            <h1 className="text-slate-900 text-5xl font-black tracking-tight mb-3 italic">¡Bienvenido, <span className="text-blue-700">{user?.name?.split(' ')[0]}!</span></h1>
                            <p className="text-slate-400 text-lg font-medium">Gestiona tus finanzas y expande tu capital hoy.</p>
                        </div>
                        <button 
                            onClick={fetchData}
                            className="p-5 bg-white rounded-3xl shadow-sm border border-slate-100 text-slate-400 hover:text-blue-600 hover:shadow-lg transition-all group"
                            title="Actualizar saldos"
                        >
                            <RefreshCcw className={`w-6 h-6 group-hover:rotate-180 transition-all duration-500 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {/* Action Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        <button 
                            onClick={() => setShowCreateModal(true)}
                            className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:shadow-xl hover:shadow-blue-200/20 group transition-all"
                        >
                            <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <Plus className="w-8 h-8" />
                            </div>
                            <div className="text-left">
                                <p className="text-slate-900 font-black text-xl mb-1 italic">Abrir Nueva Cuenta</p>
                                <p className="text-slate-400 text-sm font-medium">Ahorros o Corriente instantánea</p>
                            </div>
                        </button>
                        <button 
                            onClick={() => setShowLinkModal(true)}
                            className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:shadow-xl hover:shadow-emerald-200/20 group transition-all"
                        >
                            <div className="w-16 h-16 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                <Globe className="w-8 h-8" />
                            </div>
                            <div className="text-left">
                                <p className="text-slate-900 font-black text-xl mb-1 italic">Vincular Banco</p>
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
                        {loading ? (
                            <div className="text-center py-10 text-slate-400 font-bold animate-pulse italic">Sincronizando cuentas...</div>
                        ) : accounts.length === 0 ? (
                            <div className="bg-white p-10 rounded-[2.5rem] border border-dashed border-slate-200 text-center">
                                <Coins className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold italic">No tienes cuentas activas aún.</p>
                            </div>
                        ) : (
                            accounts.map((acc: any) => (
                                <div key={acc.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 flex items-center justify-between group hover:border-blue-100 transition-all">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                                            {acc.type === 'SAVINGS' ? <TrendingUp className="w-8 h-8" /> : <Landmark className="w-8 h-8" />}
                                        </div>
                                        <div>
                                            <p className="text-slate-900 font-black text-lg mb-1">{acc.type === 'SAVINGS' ? 'Cuenta de Ahorros' : 'Cuenta Corriente'}</p>
                                            <p className="text-slate-400 text-sm font-mono font-medium tracking-wider">{formatAccountNumber(acc.accountNumber)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-6">
                                        <div>
                                            <p className="text-slate-900 font-black text-2xl tracking-tighter">
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
                            externalAccounts.map((ext: any) => (
                                <div key={ext.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 flex items-center justify-between group hover:border-emerald-100 transition-all">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 transition-all">
                                            <Landmark className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <p className="text-slate-900 font-black text-lg mb-1">{ext.bankName}</p>
                                            <p className="text-slate-400 text-sm font-mono font-medium tracking-wider">{formatAccountNumber(ext.accountNumber)}</p>
                                            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-1">Titular: {ext.holderName}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteExternal(ext)}
                                        className="p-4 bg-slate-50 rounded-2xl text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
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
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 mx-auto mb-4">
                                <Plus className="w-10 h-10" />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 italic">Nueva Cuenta</h3>
                            <p className="text-slate-400 font-medium mt-1">Elige el tipo de portafolio</p>
                        </div>
                        <div className="space-y-4 mb-10">
                            <button 
                                onClick={() => setNewAccountType('SAVINGS')}
                                className={`w-full p-6 rounded-[2rem] border-4 transition-all flex items-center justify-between text-left ${newAccountType === 'SAVINGS' ? 'border-blue-600 bg-blue-50/20' : 'border-slate-50 hover:border-slate-100'}`}
                            >
                                <div>
                                    <p className="font-black text-slate-900 text-lg">Ahorros</p>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Rentabilidad 12% E.A.</p>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-4 ${newAccountType === 'SAVINGS' ? 'border-blue-600 bg-white' : 'border-slate-200'}`} />
                            </button>
                            <button 
                                onClick={() => setNewAccountType('CHECKING')}
                                className={`w-full p-6 rounded-[2rem] border-4 transition-all flex items-center justify-between text-left ${newAccountType === 'CHECKING' ? 'border-blue-600 bg-blue-50/20' : 'border-slate-50 hover:border-slate-100'}`}
                            >
                                <div>
                                    <p className="font-black text-slate-900 text-lg">Corriente</p>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Sobregiro de $1M</p>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-4 ${newAccountType === 'CHECKING' ? 'border-blue-600 bg-white' : 'border-slate-200'}`} />
                            </button>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setShowCreateModal(false)} className="flex-1 py-5 text-slate-400 font-black hover:bg-slate-50 rounded-[1.5rem] transition-all">Cancelar</button>
                            <button onClick={handleCreateAccount} className="flex-[2] bg-blue-600 text-white py-5 rounded-[1.5rem] font-black shadow-xl shadow-blue-200 active:scale-95 transition-all">Confirmar Apertura</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Link Bank Modal */}
            {showLinkModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-600 mx-auto mb-4">
                                <Globe className="w-10 h-10" />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 italic">Vincular Banco</h3>
                            <p className="text-slate-400 font-medium mt-1">Conecta tus entidades externas</p>
                        </div>
                        <div className="space-y-4 mb-10">
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
                        <div className="flex gap-4">
                            <button onClick={() => setShowLinkModal(false)} className="flex-1 py-5 text-slate-400 font-black hover:bg-slate-50 rounded-[1.5rem] transition-all">Cancelar</button>
                            <button onClick={handleLinkBank} className="flex-[2] bg-emerald-600 text-white py-5 rounded-[1.5rem] font-black shadow-xl shadow-emerald-200 active:scale-95 transition-all">Vincular Ahora</button>
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
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[70] flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300 text-center">
                        <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center text-red-500 mx-auto mb-6">
                            <Trash2 className="w-10 h-10" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 italic mb-2">¿Desvincular Banco?</h3>
                        <p className="text-slate-400 font-medium mb-8">
                            Estás a punto de desvincular la cuenta de <span className="text-slate-900 font-bold">{accountToDelete?.bankName}</span>. 
                            No podrás realizar transferencias a ella hasta que la vincules de nuevo.
                        </p>
                        
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={confirmDelete}
                                className="w-full bg-red-500 text-white py-5 rounded-[1.5rem] font-black shadow-xl shadow-red-200 active:scale-95 transition-all text-lg"
                            >
                                Sí, desvincular ahora
                            </button>
                            <button 
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setAccountToDelete(null);
                                }} 
                                className="w-full py-5 text-slate-400 font-black hover:bg-slate-50 rounded-[1.5rem] transition-all"
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
