import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    AlertCircle,
    ArrowLeft,
    CalendarDays,
    Clock,
    Filter,
    Hash,
    Receipt,
    TrendingDown,
    TrendingUp,
    Wallet,
    X,
} from 'lucide-react';
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
    accountNumber?: string;
}

const Movements: React.FC<MovementsProps> = ({ onBack }) => {
    const PAGE_SIZE = 10;
    const [movements, setMovements] = useState<Movement[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        setLoadError('');

        try {
            const [accRes, movRes] = await Promise.all([
                api.get('/accounts/me'),
                api.get('/transactions/history')
            ]);
            setAccounts(accRes.data);
            setMovements(movRes.data);
            setCurrentPage(1);
        } catch (err) {
            console.error(err);
            setLoadError('No fue posible cargar el historial de movimientos. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    useEffect(() => {
        setCurrentPage(1);
    }, [typeFilter, startDate, endDate, minAmount, maxAmount]);

    const getAccount = (id: number) => accounts.find(a => a.id === id);
    const getAccountName = (id: number) => {
        const acc = getAccount(id);
        return acc ? (acc.type === 'SAVINGS' ? 'Ahorros' : 'Corriente') : 'Cuenta Externa';
    };

    const isOutgoing = (mov: Movement) => accounts.some(a => a.id === mov.fromAccountId);
    const getMovementType = (mov: Movement) => isOutgoing(mov) ? 'OUTGOING' : 'INCOMING';
    const getMovementLabel = (mov: Movement) => {
        if (mov.description?.toLowerCase().includes('abono') || mov.fromAccountId === null) {
            return 'Depósito';
        }

        return isOutgoing(mov) ? 'Transferencia enviada' : 'Transferencia recibida';
    };
    const maskAccountNumber = (accountNumber?: string) => {
        if (!accountNumber) return 'No disponible';

        const lastDigits = accountNumber.slice(-4);
        return `**** **** **** ${lastDigits}`;
    };
    const getMaskedAccount = (id: number) => maskAccountNumber(getAccount(id)?.accountNumber);
    const formatCurrency = (amount: number) => (
        new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0,
        }).format(amount)
    );
    const formatDateTime = (value: string) => (
        new Intl.DateTimeFormat('es-CO', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(new Date(value))
    );
    const resetFilters = () => {
        setTypeFilter('ALL');
        setStartDate('');
        setEndDate('');
        setMinAmount('');
        setMaxAmount('');
    };

    const min = minAmount === '' ? null : Number(minAmount);
    const max = maxAmount === '' ? null : Number(maxAmount);
    const filtersError = (() => {
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            return 'La fecha inicial no puede ser posterior a la fecha final.';
        }

        if ((min !== null && Number.isNaN(min)) || (max !== null && Number.isNaN(max))) {
            return 'Los montos deben ser números válidos.';
        }

        if ((min !== null && min < 0) || (max !== null && max < 0)) {
            return 'Los montos no pueden ser negativos.';
        }

        if (min !== null && max !== null && min > max) {
            return 'El monto mínimo no puede ser mayor al monto máximo.';
        }

        return '';
    })();

    const filteredMovements = useMemo(() => movements.filter((mov) => {
        if (filtersError) return false;

        const movementDate = new Date(mov.createdAt);
        const amount = Math.abs(mov.amount);

        if (typeFilter !== 'ALL' && getMovementType(mov) !== typeFilter) return false;
        if (startDate && movementDate < new Date(`${startDate}T00:00:00`)) return false;
        if (endDate && movementDate > new Date(`${endDate}T23:59:59`)) return false;
        if (min !== null && amount < min) return false;
        if (max !== null && amount > max) return false;

        return true;
    }), [endDate, filtersError, max, min, movements, startDate, typeFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredMovements.length / PAGE_SIZE));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const pageStart = (safeCurrentPage - 1) * PAGE_SIZE;
    const paginatedMovements = filteredMovements.slice(pageStart, pageStart + PAGE_SIZE);
    const pageFirstItem = filteredMovements.length === 0 ? 0 : pageStart + 1;
    const pageLastItem = Math.min(pageStart + PAGE_SIZE, filteredMovements.length);

    return (
        <div className="w-full h-screen flex flex-col bg-slate-50 overflow-hidden">
            <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-white bg-white/50 p-4 backdrop-blur-md sm:gap-4 sm:p-6 lg:p-8">
                <button onClick={onBack} className="rounded-xl p-2.5 transition-all hover:bg-slate-100 sm:p-3">
                    <ArrowLeft className="h-5 w-5 text-slate-600 sm:h-6 sm:w-6" />
                </button>
                <h1 className="text-xl font-black text-slate-900 sm:text-2xl italic">Historial de Movimientos</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:items-end">
                            <div className="lg:col-span-1">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                    Tipo
                                </label>
                                <select
                                    value={typeFilter}
                                    onChange={(event) => setTypeFilter(event.target.value)}
                                    className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition-all focus:border-blue-600 focus:bg-white"
                                >
                                    <option value="ALL">Todos</option>
                                    <option value="OUTGOING">Enviadas</option>
                                    <option value="INCOMING">Recibidas</option>
                                </select>
                            </div>
                            <div className="lg:col-span-1">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                    Desde
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(event) => setStartDate(event.target.value)}
                                    className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition-all focus:border-blue-600 focus:bg-white"
                                />
                            </div>
                            <div className="lg:col-span-1">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                    Hasta
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(event) => setEndDate(event.target.value)}
                                    className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition-all focus:border-blue-600 focus:bg-white"
                                />
                            </div>
                            <div className="lg:col-span-1">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                    Monto mínimo
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={minAmount}
                                    onChange={(event) => setMinAmount(event.target.value)}
                                    placeholder="$0"
                                    className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition-all focus:border-blue-600 focus:bg-white"
                                />
                            </div>
                            <div className="lg:col-span-1">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                    Monto máximo
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={maxAmount}
                                    onChange={(event) => setMaxAmount(event.target.value)}
                                    placeholder="$0"
                                    className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition-all focus:border-blue-600 focus:bg-white"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-slate-200 sm:col-span-2 lg:col-span-1"
                            >
                                <Filter className="h-4 w-4" />
                                Limpiar
                            </button>
                        </div>
                    </div>

                    {filtersError && (
                        <div className="flex items-start gap-3 rounded-3xl border border-red-100 bg-red-50 p-4 text-red-600 sm:p-5">
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                            <div>
                                <p className="text-sm font-black uppercase tracking-widest">Filtros inválidos</p>
                                <p className="mt-1 text-sm font-medium">{filtersError}</p>
                            </div>
                        </div>
                    )}

                    {loadError && (
                        <div className="flex flex-col gap-4 rounded-3xl border border-red-100 bg-red-50 p-4 text-red-600 sm:flex-row sm:items-start sm:justify-between sm:p-5">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                                <div>
                                    <p className="text-sm font-black uppercase tracking-widest">Historial no disponible</p>
                                    <p className="mt-1 text-sm font-medium">{loadError}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => void fetchData()}
                                className="rounded-2xl bg-white px-4 py-3 text-xs font-black uppercase tracking-widest text-red-600 shadow-sm transition-all hover:bg-red-600 hover:text-white"
                            >
                                Reintentar
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-20 text-slate-400 font-bold animate-pulse italic">Consultando registros...</div>
                    ) : loadError ? (
                        <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm sm:p-16">
                            <AlertCircle className="mx-auto mb-5 h-12 w-12 text-red-200 sm:mb-6 sm:h-16 sm:w-16" />
                            <h3 className="text-lg font-bold text-slate-400 sm:text-xl italic">No se pudo mostrar el historial.</h3>
                        </div>
                    ) : movements.length === 0 ? (
                        <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm sm:p-16">
                            <Clock className="mx-auto mb-5 h-12 w-12 text-slate-200 sm:mb-6 sm:h-16 sm:w-16" />
                            <h3 className="text-lg font-bold text-slate-400 sm:text-xl italic">No hay movimientos registrados aún.</h3>
                        </div>
                    ) : filtersError ? (
                        <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm sm:p-16">
                            <Filter className="mx-auto mb-5 h-12 w-12 text-slate-200 sm:mb-6 sm:h-16 sm:w-16" />
                            <h3 className="text-lg font-bold text-slate-400 sm:text-xl italic">Corrige los filtros para consultar el historial.</h3>
                        </div>
                    ) : filteredMovements.length === 0 ? (
                        <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm sm:p-16">
                            <Filter className="mx-auto mb-5 h-12 w-12 text-slate-200 sm:mb-6 sm:h-16 sm:w-16" />
                            <h3 className="text-lg font-bold text-slate-400 sm:text-xl italic">No hay movimientos que coincidan con los filtros.</h3>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {paginatedMovements.map((mov: Movement) => (
                                    <button
                                        key={mov.id}
                                        type="button"
                                        onClick={() => setSelectedMovement(mov)}
                                        className="flex w-full flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition-all hover:border-blue-100 hover:shadow-md active:scale-[0.99] sm:flex-row sm:items-center sm:justify-between sm:p-6 group"
                                    >
                                        <div className="flex min-w-0 items-center gap-4 sm:gap-6">
                                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all sm:h-14 sm:w-14 ${
                                                isOutgoing(mov) ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'
                                            }`}>
                                                {isOutgoing(mov) ? <TrendingDown className="h-6 w-6 sm:h-7 sm:w-7" /> : <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="mb-1 truncate text-base font-black text-slate-900 sm:text-lg">{mov.description}</p>
                                                <p className="text-xs font-medium text-slate-400 sm:text-sm">
                                                    {isOutgoing(mov) ? `Para: ${getAccountName(mov.toAccountId)}` : `De: ${getAccountName(mov.fromAccountId)}`}
                                                    {' • '}
                                                    {formatDateTime(mov.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-end justify-between gap-4 sm:block sm:text-right">
                                            <p className={`text-lg font-black sm:text-xl italic ${
                                                isOutgoing(mov) ? 'text-slate-900' : 'text-emerald-500'
                                            }`}>
                                                {isOutgoing(mov) ? '-' : '+'}{formatCurrency(mov.amount)}
                                            </p>
                                            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-1">Confirmado</p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm font-bold text-slate-400">
                                    Mostrando {pageFirstItem}-{pageLastItem} de {filteredMovements.length} movimientos
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                                        disabled={safeCurrentPage === 1}
                                        className="flex-1 rounded-2xl border border-slate-100 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                                    >
                                        Anterior
                                    </button>
                                    <span className="rounded-2xl bg-slate-100 px-4 py-3 text-xs font-black text-slate-500">
                                        {safeCurrentPage}/{totalPages}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                                        disabled={safeCurrentPage === totalPages}
                                        className="flex-1 rounded-2xl border border-slate-100 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {selectedMovement && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md sm:p-6">
                    <div className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-8">
                        <div className="mb-6 flex items-start justify-between gap-3 sm:mb-8 sm:gap-4">
                            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl sm:h-16 sm:w-16 sm:rounded-3xl ${
                                    isOutgoing(selectedMovement) ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'
                                }`}>
                                    <Receipt className="h-6 w-6 sm:h-8 sm:w-8" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Detalle de transacción
                                    </p>
                                    <h2 className="mt-2 break-words text-xl font-black text-slate-900 sm:text-3xl italic">
                                        {getMovementLabel(selectedMovement)}
                                    </h2>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedMovement(null)}
                                className="shrink-0 rounded-2xl p-2.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700 sm:p-3"
                                title="Cerrar detalle"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="mb-5 rounded-3xl border border-blue-100 bg-blue-50/40 p-5 sm:mb-6 sm:p-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Monto</p>
                            <p className={`mt-3 break-words text-3xl font-black tracking-tight sm:text-5xl sm:tracking-tighter ${
                                isOutgoing(selectedMovement) ? 'text-slate-900' : 'text-emerald-500'
                            }`}>
                                {isOutgoing(selectedMovement) ? '-' : '+'}{formatCurrency(selectedMovement.amount)}
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                                <div className="mb-3 flex items-center gap-2 text-slate-400">
                                    <Hash className="h-4 w-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">ID</p>
                                </div>
                                <p className="font-mono text-sm font-bold text-slate-900">#{selectedMovement.id}</p>
                            </div>

                            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                                <div className="mb-3 flex items-center gap-2 text-slate-400">
                                    <CalendarDays className="h-4 w-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Fecha y hora</p>
                                </div>
                                <p className="text-sm font-bold text-slate-900">{formatDateTime(selectedMovement.createdAt)}</p>
                            </div>

                            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                                <div className="mb-3 flex items-center gap-2 text-slate-400">
                                    <Wallet className="h-4 w-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Origen</p>
                                </div>
                                <p className="text-sm font-black text-slate-900">{getAccountName(selectedMovement.fromAccountId)}</p>
                                <p className="mt-1 break-all font-mono text-xs font-bold tracking-widest text-slate-400">
                                    {getMaskedAccount(selectedMovement.fromAccountId)}
                                </p>
                            </div>

                            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                                <div className="mb-3 flex items-center gap-2 text-slate-400">
                                    <Wallet className="h-4 w-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Destino</p>
                                </div>
                                <p className="text-sm font-black text-slate-900">{getAccountName(selectedMovement.toAccountId)}</p>
                                <p className="mt-1 break-all font-mono text-xs font-bold tracking-widest text-slate-400">
                                    {getMaskedAccount(selectedMovement.toAccountId)}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 rounded-3xl border border-slate-100 bg-white p-5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Descripción</p>
                            <p className="mt-2 break-words text-sm font-bold text-slate-900">
                                {selectedMovement.description || 'Sin descripción'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Movements;
