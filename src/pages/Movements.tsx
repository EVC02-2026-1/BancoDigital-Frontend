import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import api from '../api/api';

interface MovementsProps {
    onBack: () => void;
}

interface Movement {
    id: number;
    description: string;
    createdAt: string;
    amount: number;
    fromAccountId: number;
    toAccountId: number;
}

interface Account {
    id: number;
    type: string;
}

const Movements: React.FC<MovementsProps> = ({ onBack }) => {
    const [movements, setMovements] = useState<Movement[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [accRes, movRes] = await Promise.all([
                    api.get('/accounts/me'),
                    api.get('/transactions/history')
                ]);
                setAccounts(accRes.data);
                setMovements(movRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getAccountName = (id: number) => {
        const acc = accounts.find(a => a.id === id);
        return acc ? (acc.type === 'SAVINGS' ? 'Ahorros' : 'Corriente') : 'Cuenta Externa';
    };

    const isOutgoing = (mov: Movement) => accounts.some(a => a.id === mov.fromAccountId);

    return (
        <div className="w-full h-screen flex flex-col bg-slate-50 overflow-hidden">
            <div className="p-8 flex items-center gap-4 border-b border-white bg-white/50 backdrop-blur-md sticky top-0 z-10">
                <button onClick={onBack} className="p-3 hover:bg-slate-100 rounded-xl transition-all">
                    <ArrowLeft className="w-6 h-6 text-slate-600" />
                </button>
                <h1 className="text-2xl font-black text-slate-900 italic">Historial de Movimientos</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    {loading ? (
                        <div className="text-center py-20 text-slate-400 font-bold animate-pulse italic">Consultando registros...</div>
                    ) : movements.length === 0 ? (
                        <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
                            <Clock className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                            <h3 className="text-xl font-bold text-slate-400 italic">No hay movimientos registrados aún.</h3>
                        </div>
                    ) : (
                        movements.map((mov: Movement) => (
                            <div key={mov.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all active:scale-[0.99] cursor-default">
                                <div className="flex items-center gap-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                                        isOutgoing(mov) ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'
                                    }`}>
                                        {isOutgoing(mov) ? <TrendingDown className="w-7 h-7" /> : <TrendingUp className="w-7 h-7" />}
                                    </div>
                                    <div>
                                        <p className="text-slate-900 font-black text-lg mb-1">{mov.description}</p>
                                        <p className="text-slate-400 text-sm font-medium">
                                            {isOutgoing(mov) ? `Para: ${getAccountName(mov.toAccountId)}` : `De: ${getAccountName(mov.fromAccountId)}`}
                                            {' • '}
                                            {new Date(mov.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-xl font-black italic ${
                                        isOutgoing(mov) ? 'text-slate-900' : 'text-emerald-500'
                                    }`}>
                                        {isOutgoing(mov) ? '-' : '+'}${mov.amount.toLocaleString()}
                                    </p>
                                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-1">Confirmado</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Movements;
