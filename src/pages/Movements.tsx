import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, TrendingUp, TrendingDown, Filter, FileText, X, Download } from 'lucide-react';
import api from '../api/api';

interface MovementsProps {
    onBack: () => void;
}

const Movements: React.FC<MovementsProps> = ({ onBack }) => {
    const [movements, setMovements] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedMov, setSelectedMov] = useState<any>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const [accRes, movRes] = await Promise.all([
                api.get('/accounts/me'),
                api.get('/transactions/history', { params })
            ]);
            setAccounts(accRes.data);
            setMovements(movRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const isOutgoing = (mov: any) => mov.isOutgoing;

    return (
        <div className="w-full h-screen flex flex-col bg-slate-50 overflow-hidden">
            <div className="p-8 flex items-center justify-between border-b border-white bg-white/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-3 hover:bg-slate-100 rounded-xl transition-all">
                        <ArrowLeft className="w-6 h-6 text-slate-600" />
                    </button>
                    <h1 className="text-2xl font-black text-slate-900 italic">Historial de Movimientos</h1>
                </div>
                
                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 px-4 border-r border-slate-100">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Filtrar:</span>
                    </div>
                    <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-transparent text-sm font-bold text-slate-600 focus:outline-none"
                    />
                    <span className="text-slate-300 font-bold">-</span>
                    <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-transparent text-sm font-bold text-slate-600 focus:outline-none"
                    />
                    <button 
                        onClick={fetchData}
                        className="bg-slate-900 text-white text-xs font-black px-4 py-2 rounded-xl hover:bg-slate-800 transition-all active:scale-95"
                    >
                        APLICAR
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    {loading ? (
                        <div className="text-center py-20 text-slate-400 font-bold animate-pulse italic">Consultando registros...</div>
                    ) : movements.length === 0 ? (
                        <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
                            <Clock className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                            <h3 className="text-xl font-bold text-slate-400 italic font-medium">No hay movimientos registrados aún.</h3>
                        </div>
                    ) : (
                        movements.map((mov: any) => (
                            <div key={mov.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
                                <div className="flex items-center gap-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                                        isOutgoing(mov) ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'
                                    }`}>
                                        {isOutgoing(mov) ? <TrendingDown className="w-7 h-7" /> : <TrendingUp className="w-7 h-7" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <p className="text-slate-900 font-black text-lg">{mov.description}</p>
                                            <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full uppercase italic">
                                                {mov.accountType === 'SAVINGS' ? 'Ahorros' : 'Corriente'}
                                            </span>
                                        </div>
                                        <p className="text-slate-400 text-sm font-medium">
                                            {isOutgoing(mov) ? `Para: ${mov.toAccountMasked}` : `De: ${mov.fromAccountMasked}`}
                                            {' • '}
                                            {new Date(mov.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <p className={`text-xl font-black italic ${
                                            isOutgoing(mov) ? 'text-slate-900' : 'text-emerald-500'
                                        }`}>
                                            {isOutgoing(mov) ? '-' : '+'}${mov.amount.toLocaleString()}
                                        </p>
                                        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-1">Confirmado</p>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedMov(mov)}
                                        className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all group-hover:scale-110"
                                        title="Ver Comprobante"
                                    >
                                        <FileText className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal de Comprobante */}
            {selectedMov && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
                        <div className="bg-slate-900 p-12 text-white relative">
                            <button 
                                onClick={() => setSelectedMov(null)}
                                className="absolute top-8 right-8 p-2 hover:bg-white/10 rounded-full transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/20">
                                <FileText className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-3xl font-black italic leading-tight">Comprobante de <br />Transferencia</h2>
                            <p className="text-emerald-400 font-black mt-4 uppercase tracking-widest text-sm italic">Transacción Exitosa</p>
                        </div>
                        
                        <div className="p-12 space-y-8 bg-slate-50/50">
                            <div className="space-y-6">
                                <div className="flex justify-between items-center pb-6 border-b border-slate-200/60">
                                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Referencia</span>
                                    <span className="text-slate-900 font-black italic">{selectedMov.referenceNumber || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center pb-6 border-b border-slate-200/60">
                                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Fecha</span>
                                    <span className="text-slate-900 font-bold">{new Date(selectedMov.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center pb-6 border-b border-slate-200/60">
                                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Monto</span>
                                    <span className="text-slate-900 font-black text-2xl italic text-emerald-500">${selectedMov.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center pb-6 border-b border-slate-200/60">
                                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Destino</span>
                                    <span className="text-slate-900 font-bold">{selectedMov.toAccountMasked}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Tipo de Cuenta</span>
                                    <span className="text-slate-900 font-bold uppercase text-xs bg-slate-200 px-3 py-1 rounded-full italic">
                                        {selectedMov.accountType === 'SAVINGS' ? 'Ahorros' : 'Corriente'}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-8 flex gap-4">
                                <button className="flex-1 bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 italic">
                                    <Download className="w-5 h-5" />
                                    DESCARGAR PDF
                                </button>
                                <button 
                                    onClick={() => setSelectedMov(null)}
                                    className="flex-1 bg-slate-200 text-slate-600 font-black py-4 rounded-2xl hover:bg-slate-300 transition-all italic"
                                >
                                    CERRAR
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Movements;
