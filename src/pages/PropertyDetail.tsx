import { ArrowLeft, MessageCircle, CheckCircle, History, Calendar, Pencil, AlertTriangle, Share2, X } from 'lucide-react';
import type { Property } from '../types';
import { formatCurrency, formatDate } from '../lib/format';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';

interface PropertyDetailProps {
    property: Property;
    onBack: () => void;
    onMarkAsPaid: (id: string) => void;
    onEdit: (property: Property) => void;
}

interface PaymentHistory {
    id: string;
    due_date: string;
    paid_at: string;
    status: string;
}

export function PropertyDetail({ property, onBack, onMarkAsPaid, onEdit }: PropertyDetailProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [history, setHistory] = useState<PaymentHistory[]>([]);
    const [showReceipt, setShowReceipt] = useState(false); // New state for Receipt Screen

    useEffect(() => {
        fetchHistory();
    }, [property.id]);

    const fetchHistory = async () => {
        const { data } = await supabase
            .from('payments')
            .select('*')
            .eq('property_id', property.id)
            .order('due_date', { ascending: false })
            .limit(3);

        if (data) setHistory(data);
    };

    const handleWhatsApp = () => {
        const message = encodeURIComponent(
            `Olá ${property.tenant.name}, tudo bem? Aqui é o proprietário. O aluguel da ${property.address} no valor de ${formatCurrency(property.rentAmount)} venceu dia ${formatDate(property.dueDate)}. Podemos ver isso? Abraços.`
        );

        const isDesktop = window.matchMedia('(min-width: 768px)').matches;
        const baseUrl = isDesktop ? 'https://web.whatsapp.com/send' : 'https://wa.me';

        // Ensure phone has only numbers
        const cleanPhone = property.tenant.phone.replace(/\D/g, '');

        if (isDesktop) {
            window.open(`${baseUrl}?phone=${cleanPhone}&text=${message}`, '_blank');
        } else {
            window.open(`${baseUrl}/${cleanPhone}?text=${message}`, '_blank');
        }
    };

    const handleConfirmPayment = async () => {
        if (!confirm('Confirmar o recebimento do pagamento?')) return;

        setIsProcessing(true);
        try {
            // 1. Insert into Supabase
            const { error } = await supabase.from('payments').insert([
                {
                    property_id: property.id,
                    due_date: property.dueDate, // Assuming payment is for current due date
                    status: 'paid',
                    paid_at: new Date().toISOString(),
                }
            ]);

            if (error) throw error;

            // 2. Trigger Confetti
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#22C55E', '#86EFAC', '#FFD700'] // Green & Gold
            });

            // 3. Update UI & Show Receipt
            onMarkAsPaid(property.id);
            fetchHistory(); // Refresh history
            setShowReceipt(true); // Show Receipt Screen

        } catch (error) {
            console.error('Error recording payment:', error);
            alert('Erro ao registrar pagamento. Verifique sua conexão.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSendReceipt = (amount: number = property.rentAmount, date: Date = new Date()) => {
        const monthName = date.toLocaleDateString('pt-BR', { month: 'long' });
        const message = encodeURIComponent(
            `Olá *${property.tenant.name}*! ✅\n` +
            `Confirmo o recebimento do aluguel da *${property.address}*.\n` +
            `Valor: *${formatCurrency(amount)}*\n` +
            `Referente a: *${monthName}*\n\n` +
            `Muito obrigado!`
        );

        const isDesktop = window.matchMedia('(min-width: 768px)').matches;
        const baseUrl = isDesktop ? 'https://web.whatsapp.com/send' : 'https://wa.me';
        const cleanPhone = property.tenant.phone.replace(/\D/g, '');

        if (isDesktop) {
            window.open(`${baseUrl}?phone=${cleanPhone}&text=${message}`, '_blank');
        } else {
            window.open(`${baseUrl}/${cleanPhone}?text=${message}`, '_blank');
        }
    };

    // Contract Logic
    const getContractStatus = () => {
        if (!property.contractEnd) return null;

        const today = new Date();
        const endDate = new Date(property.contractEnd);
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { status: 'expired', label: 'CONTRATO VENCIDO', color: 'bg-red-100 text-red-700 border-red-200' };
        if (diffDays <= 30) return { status: 'expiring', label: 'CONTRATO VENCENDO', color: 'bg-orange-100 text-orange-700 border-orange-200' };

        return null;
    };

    const contractAlert = getContractStatus();

    // RENDER RECEIPT SCREEN
    if (showReceipt) {
        return (
            <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <CheckCircle size={48} className="text-green-600" />
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Pagamento Registrado!</h2>
                <p className="text-gray-500 text-center mb-10 text-lg">
                    Deseja enviar o recibo para o inquilino agora?
                </p>

                <button
                    onClick={() => handleSendReceipt()}
                    className="w-full max-w-sm py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg mb-4 transition-all active:scale-95"
                >
                    <Share2 size={24} />
                    ENVIAR RECIBO DIGITAL
                </button>

                <button
                    onClick={onBack}
                    className="w-full max-w-sm py-4 text-gray-400 font-medium hover:text-gray-600 flex items-center justify-center gap-2"
                >
                    <X size={20} />
                    Não, apenas fechar
                </button>
            </div>
        );
    }

    return (
        <div className="pb-24 pt-6 px-4 min-h-screen bg-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={32} />
                    </button>
                    <h1 className="text-2xl font-bold ml-2">Detalhes</h1>
                </div>
                <button
                    onClick={() => onEdit(property)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Editar Imóvel"
                >
                    <Pencil size={24} />
                </button>
            </div>

            {/* Tenant Info & Status */}
            <div className="mb-8 text-center">
                <div className="inline-block mb-4">
                    {property.status === 'paid' ? (
                        <span className="px-6 py-2 rounded-full bg-success-light text-success-dark text-lg font-bold flex items-center gap-2 border border-success-dark">
                            <CheckCircle size={24} /> PAGO
                        </span>
                    ) : property.status === 'late' ? (
                        <span className="px-6 py-2 rounded-full bg-error-light text-error-dark text-lg font-bold flex items-center gap-2 border border-error-dark">
                            <Calendar size={24} /> ATRASADO
                        </span>
                    ) : (
                        <span className="px-6 py-2 rounded-full bg-yellow-100 text-yellow-700 text-lg font-bold flex items-center gap-2 border border-yellow-500">
                            <Calendar size={24} /> PENDENTE
                        </span>
                    )}
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">{property.tenant.name}</h2>
                <p className="text-lg text-gray-500">{property.address}</p>

                {/* Contract Alert */}
                {contractAlert && (
                    <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${contractAlert.color} font-bold animate-pulse`}>
                        <AlertTriangle size={20} />
                        {contractAlert.label}
                    </div>
                )}
            </div>

            {/* Contract Info Section */}
            {(property.contractStart || property.contractEnd) && (
                <div className="bg-blue-50 rounded-xl p-4 mb-8 border border-blue-100">
                    <h3 className="text-sm font-bold text-blue-800 uppercase mb-3 flex items-center gap-2">
                        <Calendar size={16} /> Dados do Contrato
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="block text-xs text-blue-600 uppercase">Entrada</span>
                            <span className="text-lg font-semibold text-blue-900">
                                {property.contractStart ? new Date(property.contractStart).toLocaleDateString('pt-BR') : '-'}
                            </span>
                        </div>
                        <div>
                            <span className="block text-xs text-blue-600 uppercase">Vencimento</span>
                            <span className="text-lg font-semibold text-blue-900">
                                {property.contractEnd ? new Date(property.contractEnd).toLocaleDateString('pt-BR') : '-'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Big Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {property.status !== 'paid' && (
                    <button
                        onClick={handleConfirmPayment}
                        disabled={isProcessing}
                        className="flex flex-col items-center justify-center p-8 bg-success-dark hover:bg-green-600 text-white rounded-2xl shadow-lg active:scale-95 transition-all"
                    >
                        <CheckCircle size={48} className="mb-2" />
                        <span className="text-xl font-bold">CONFIRMAR PAGAMENTO</span>
                        <span className="text-sm opacity-90 mt-1">Marcar como recebido</span>
                    </button>
                )}

                {property.status === 'late' && (
                    <button
                        onClick={handleWhatsApp}
                        className="flex flex-col items-center justify-center p-8 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-2xl shadow-lg active:scale-95 transition-all"
                    >
                        <MessageCircle size={48} className="mb-2" />
                        <span className="text-xl font-bold">COBRAR NO WHATSAPP</span>
                        <span className="text-sm opacity-90 mt-1">Enviar lembrete amigável</span>
                    </button>
                )}

                {property.status === 'paid' && (
                    <div className="md:col-span-2 bg-gray-50 p-8 rounded-2xl border border-gray-200 text-center">
                        <p className="text-gray-500 text-lg">Nenhuma ação necessária.</p>
                        <p className="text-gray-900 font-bold text-xl">Tudo certo por aqui! 🎉</p>
                    </div>
                )}
            </div>

            {/* Payment History */}
            <div className="border-t border-gray-100 pt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <History size={20} />
                    Histórico Recente
                </h3>

                {history.length > 0 ? (
                    <div className="space-y-3">
                        {history.map(record => (
                            <div key={record.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="font-bold text-gray-900">
                                        {new Date(record.due_date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Pago em {new Date(record.paid_at).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-success-light text-success-dark text-xs font-bold rounded-full">
                                        PAGO
                                    </span>
                                    <button
                                        onClick={() => handleSendReceipt(property.rentAmount, new Date(record.due_date))}
                                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                        title="Enviar Recibo"
                                    >
                                        <Share2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-center py-4">Nenhum histórico disponível.</p>
                )}
            </div>
        </div>
    );
}
