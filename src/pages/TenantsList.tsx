import { Phone, Home, Search } from 'lucide-react';
import type { Property } from '../types';
import { useState } from 'react';

interface TenantsListProps {
    properties: Property[];
    onSelectTenant: (tenantName: string) => void;
}

export function TenantsList({ properties, onSelectTenant }: TenantsListProps) {
    const [searchTerm, setSearchTerm] = useState('');

    // Group by tenant name
    const tenants = properties.reduce((acc, property) => {
        const name = property.tenant.name;
        if (!acc[name]) {
            acc[name] = {
                name: name,
                phone: property.tenant.phone,
                properties: [],
            };
        }
        acc[name].properties.push(property);
        return acc;
    }, {} as Record<string, { name: string; phone: string; properties: Property[] }>);

    const tenantsList = Object.values(tenants).filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="pb-24 pt-6 px-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Inquilinos</h1>

            {/* Search Bar */}
            <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={20} className="text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Buscar por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
            </div>

            <div className="space-y-4">
                {tenantsList.map((tenant) => (
                    <button
                        key={tenant.name}
                        onClick={() => onSelectTenant(tenant.name)}
                        className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
                    >
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl shrink-0">
                            {tenant.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-lg truncate">{tenant.name}</h3>
                            <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                                <Phone size={14} />
                                {tenant.phone}
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-600 shrink-0">
                            <Home size={12} />
                            {tenant.properties.length}
                        </div>
                    </button>
                ))}

                {tenantsList.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        Nenhum inquilino encontrado.
                    </div>
                )}
            </div>
        </div>
    );
}
