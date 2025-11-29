import type { Property } from '../types';
import { PropertyCard } from '../components/PropertyCard';
import { formatCurrency } from '../lib/format';
import { TrendingUp, TrendingDown, Search } from 'lucide-react';
import { useState } from 'react';

interface DashboardProps {
    properties: Property[];
    onSelectProperty: (property: Property) => void;
    financialSummary: {
        received: number;
        toReceive: number;
    };
}

export function Dashboard({ properties, onSelectProperty, financialSummary }: DashboardProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProperties = properties.filter(p =>
        p.tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="pb-24 pt-6 px-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Meus Imóveis</h1>

            {/* Financial Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Resumo do Mês</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                            <TrendingUp size={16} className="text-green-500" /> Já Recebido
                        </span>
                        <span className="text-2xl font-bold text-green-600 truncate">
                            {formatCurrency(financialSummary.received)}
                        </span>
                    </div>
                    <div className="flex flex-col sm:border-l border-gray-100 sm:pl-4 pt-4 sm:pt-0 border-t sm:border-t-0">
                        <span className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                            <TrendingDown size={16} className="text-gray-400" /> A Receber
                        </span>
                        <span className="text-2xl font-bold text-gray-600 truncate">
                            {formatCurrency(financialSummary.toReceive)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={20} className="text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Buscar inquilino ou endereço..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
            </div>

            {/* Property List */}
            {filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProperties.map((property) => (
                        <PropertyCard
                            key={property.id}
                            property={property}
                            onClick={() => onSelectProperty(property)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 text-gray-500">
                    Nenhum imóvel encontrado para "{searchTerm}".
                </div>
            )}
        </div>
    );
}
