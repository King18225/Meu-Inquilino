import { Modal } from '../ui/Modal';
import type { Property } from '../../types';
import { Phone, Home } from 'lucide-react';
import { formatCurrency } from '../../lib/format';

interface TenantDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenantName: string | null;
    properties: Property[];
}

export function TenantDetailModal({ isOpen, onClose, tenantName, properties }: TenantDetailModalProps) {
    if (!tenantName) return null;

    const tenantProperties = properties.filter(p => p.tenant.name === tenantName);
    const tenant = tenantProperties[0]?.tenant;

    const handleWhatsApp = () => {
        if (!tenant) return;
        const message = encodeURIComponent(`Olá ${tenant.name}, tudo bem?`);
        const isDesktop = window.matchMedia('(min-width: 768px)').matches;
        const baseUrl = isDesktop ? 'https://web.whatsapp.com/send' : 'https://wa.me';
        const cleanPhone = tenant.phone.replace(/\D/g, '');

        if (isDesktop) {
            window.open(`${baseUrl}?phone=${cleanPhone}&text=${message}`, '_blank');
        } else {
            window.open(`${baseUrl}/${cleanPhone}?text=${message}`, '_blank');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Dossiê do Inquilino">
            <div className="space-y-6">
                {/* Header */}
                <div className="text-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-3xl mx-auto mb-4">
                        {tenant?.name.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{tenant?.name}</h2>
                    <button
                        onClick={handleWhatsApp}
                        className="mt-2 inline-flex items-center gap-2 text-green-600 font-bold hover:underline"
                    >
                        <Phone size={18} />
                        {tenant?.phone}
                    </button>
                </div>

                {/* Properties List */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Home size={20} />
                        Aluguéis Ativos
                    </h3>
                    <div className="space-y-3">
                        {tenantProperties.map(property => {
                            // Check contract status
                            let contractStatus = null;
                            if (property.contractEnd) {
                                const today = new Date();
                                const endDate = new Date(property.contractEnd);
                                const diffTime = endDate.getTime() - today.getTime();
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                if (diffDays < 0) contractStatus = { label: 'VENCIDO', color: 'text-red-600' };
                                else if (diffDays <= 30) contractStatus = { label: 'VENCENDO', color: 'text-orange-600' };
                            }

                            return (
                                <div key={property.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-bold text-gray-900 flex-1 pr-2">{property.address}</p>
                                        <span className="font-bold text-green-600 shrink-0">
                                            {formatCurrency(property.rentAmount)}
                                        </span>
                                    </div>
                                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="block text-gray-500 text-xs uppercase">Início</span>
                                            <span className="font-medium">
                                                {property.contractStart ? new Date(property.contractStart).toLocaleDateString('pt-BR') : '-'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-500 text-xs uppercase">Fim</span>
                                            <span className={`font-medium ${contractStatus?.color || ''}`}>
                                                {property.contractEnd ? new Date(property.contractEnd).toLocaleDateString('pt-BR') : '-'}
                                                {contractStatus && <span className="ml-1 text-xs font-bold">({contractStatus.label})</span>}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
