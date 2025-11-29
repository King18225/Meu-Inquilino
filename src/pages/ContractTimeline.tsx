import { AlertTriangle, Calendar, CheckCircle2, Coffee } from 'lucide-react';
import type { Property } from '../types';

interface ContractTimelineProps {
    properties: Property[];
    onSelectProperty: (property: Property) => void;
}

export function ContractTimeline({ properties, onSelectProperty }: ContractTimelineProps) {
    // 1. Filter properties with contract_end
    const contracts = properties
        .filter(p => p.contractEnd)
        .sort((a, b) => new Date(a.contractEnd!).getTime() - new Date(b.contractEnd!).getTime());

    // 2. Group by Month/Year
    const groupedContracts = contracts.reduce((acc, property) => {
        const date = new Date(property.contractEnd!);
        // Format: "Janeiro 2025"
        const monthYear = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
        // Capitalize first letter
        const formattedHeader = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);

        if (!acc[formattedHeader]) {
            acc[formattedHeader] = [];
        }
        acc[formattedHeader].push(property);
        return acc;
    }, {} as Record<string, Property[]>);

    const hasContracts = Object.keys(groupedContracts).length > 0;

    return (
        <div className="pb-24 pt-6 px-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="text-blue-600" />
                Agenda de Contratos
            </h1>

            {!hasContracts ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-green-50 p-6 rounded-full mb-4">
                        <Coffee size={48} className="text-green-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Tranquilo!</h2>
                    <p className="text-gray-500">Nenhum contrato vence nos próximos meses.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedContracts).map(([header, properties]) => (
                        <div key={header}>
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 sticky top-0 bg-gray-50 py-2 z-10">
                                {header}
                            </h2>
                            <div className="space-y-3">
                                {properties.map(property => {
                                    const endDate = new Date(property.contractEnd!);
                                    const today = new Date();
                                    const diffTime = endDate.getTime() - today.getTime();
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                    let status = null;
                                    if (diffDays < 0) status = { label: 'VENCIDO', color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle };
                                    else if (diffDays <= 30) status = { label: 'VENCENDO', color: 'text-orange-600', bg: 'bg-orange-50', icon: AlertTriangle };
                                    else status = { label: 'EM DIA', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 };

                                    const StatusIcon = status.icon;

                                    return (
                                        <button
                                            key={property.id}
                                            onClick={() => onSelectProperty(property)}
                                            className="w-full bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:bg-gray-50 transition-all text-left group"
                                        >
                                            {/* Date Box */}
                                            <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 ${status.bg} border border-gray-100`}>
                                                <span className={`text-xl font-bold ${status.color}`}>
                                                    {endDate.getDate()}
                                                </span>
                                                <span className={`text-[10px] font-bold uppercase ${status.color}`}>
                                                    {new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(endDate).replace('.', '')}
                                                </span>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                                    {property.tenant.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {property.address}
                                                </p>
                                            </div>

                                            {/* Status Badge (Desktop/Tablet) or Icon (Mobile) */}
                                            <div className="shrink-0">
                                                {status.label !== 'EM DIA' && (
                                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${status.bg} ${status.color}`}>
                                                        <StatusIcon size={14} />
                                                        <span className="text-xs font-bold hidden sm:inline">{status.label}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
