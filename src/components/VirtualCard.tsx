import React from 'react';
import { CreditCard, Wifi } from 'lucide-react';

interface VirtualCardProps {
    accountNumber: string;
    holderName: string;
    type: string;
    onClose: () => void;
}

const VirtualCard: React.FC<VirtualCardProps> = ({ accountNumber, holderName, type, onClose }) => {
    // Format: 1234 5678 1234 5678
    const formattedNumber = accountNumber.replace(/(\d{4})/g, '$1 ').trim();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
            <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-slate-900">Tu Tarjeta Virtual</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">Cerrar</button>
                </div>

                <div className={`relative w-full aspect-[1.58/1] rounded-2xl p-8 text-white shadow-2xl overflow-hidden ${
                    type === 'SAVINGS' ? 'bg-linear-to-br from-emerald-500 to-teal-700' : 'bg-linear-to-br from-indigo-600 to-blue-800'
                }`}>
                    {/* Glossy overlay */}
                    <div className="absolute top-0 left-0 w-full h-full bg-white/10 skew-x-12 -translate-x-1/2 pointer-events-none"></div>
                    
                    <div className="flex justify-between items-start mb-12">
                        <div className="w-12 h-10 bg-yellow-400/80 rounded-lg border border-yellow-200/50 shadow-inner">
                            <div className="w-full h-full opacity-20 bg-[radial-gradient(circle, #000 1px, transparent 1px)] bg-size-[4px_4px]"></div>
                        </div>
                        <CreditCard className="w-10 h-10 opacity-50" />
                    </div>

                    <div className="mb-8">
                        <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Número de cuenta</p>
                        <p className="text-2xl font-mono font-bold tracking-[0.2em]">{formattedNumber}</p>
                    </div>

                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Titular</p>
                            <p className="font-bold text-lg uppercase tracking-tight">{holderName}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Tipo</p>
                            <p className="font-bold">{type === 'SAVINGS' ? 'Ahorros' : 'Corriente'}</p>
                        </div>
                    </div>
                    
                    <Wifi className="absolute top-1/2 right-8 w-6 h-6 rotate-90 opacity-40" />
                </div>

                <div className="mt-8 bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <p className="text-sm text-slate-500 leading-relaxed italic text-center">
                        "Esta tarjeta es de uso virtual y exclusivo para transacciones digitales dentro de BancoDigital."
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VirtualCard;
