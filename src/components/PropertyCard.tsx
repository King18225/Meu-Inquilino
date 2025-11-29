import type { Property } from '../types';
import { formatCurrency } from '../lib/format';
import { cn } from '../lib/utils';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface PropertyCardProps {
    property: Property;
    onClick: () => void;
}

export function PropertyCard({ property, onClick }: PropertyCardProps) {
    const getStatusColor = (status: Property['status']) => {
        switch (status) {
            case 'paid': return 'bg-success-light border-success-dark text-success-dark';
            case 'late': return 'bg-error-light border-error-dark text-error-dark';
            case 'due_today': return 'bg-yellow-100 border-yellow-500 text-yellow-700';
            default: return 'bg-gray-100 border-gray-300 text-gray-600';
        }
    };

    const getStatusLabel = (status: Property['status']) => {
        switch (status) {
            case 'paid': return 'PAGO';
            case 'late': return 'ATRASADO';
            case 'due_today': return 'VENCE HOJE';
            default: return 'PENDENTE';
        }
    };

    const getStatusIcon = (status: Property['status']) => {
        switch (status) {
            case 'paid': return <CheckCircle2 size={24} />;
            case 'late': return <AlertCircle size={24} />;
            case 'due_today': return <Clock size={24} />;
            default: return null;
        }
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "w-full p-5 rounded-2xl border-l-8 shadow-sm bg-white mb-4 md:mb-0 transition-all cursor-pointer",
                "active:scale-98 md:hover:scale-[1.02] md:hover:shadow-lg", // Hover effects only on desktop
                property.status === 'late' ? "border-error-dark" :
                    property.status === 'paid' ? "border-success-dark" :
                        property.status === 'due_today' ? "border-yellow-500" : "border-gray-300"
            )}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-900">{property.tenant.name}</h3>
                <span className={cn(
                    "px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1",
                    getStatusColor(property.status)
                )}>
                    {getStatusIcon(property.status)}
                    {getStatusLabel(property.status)}
                </span>
            </div>

            <p className="text-gray-600 text-lg mb-3">{property.address}</p>

            <div className="flex justify-between items-end mt-2">
                <div>
                    <p className="text-sm text-gray-500">Valor do Aluguel</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(property.rentAmount)}</p>
                </div>
            </div>
        </div>
    );
}
