import { Home, PlusCircle, Users } from 'lucide-react';
import { Button } from '../ui/Button';

interface TopNavProps {
    activeTab: 'home' | 'tenants' | 'new';
    onTabChange: (tab: 'home' | 'tenants' | 'new') => void;
}

export function TopNav({ activeTab, onTabChange }: TopNavProps) {
    return (
        <nav className="hidden md:flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-blue-600">Meu Inquilino</h1>
            </div>

            <div className="flex items-center gap-4">
                <Button
                    variant={activeTab === 'home' ? 'primary' : 'secondary'}
                    onClick={() => onTabChange('home')}
                    className="flex items-center gap-2 h-10 text-base"
                >
                    <Home size={20} />
                    Início
                </Button>

                <Button
                    variant={activeTab === 'tenants' ? 'primary' : 'secondary'}
                    onClick={() => onTabChange('tenants')}
                    className="flex items-center gap-2 h-10 text-base"
                >
                    <Users size={20} />
                    Inquilinos
                </Button>

                <Button
                    variant={activeTab === 'new' ? 'primary' : 'secondary'}
                    onClick={() => onTabChange('new')}
                    className="flex items-center gap-2 h-10 text-base"
                >
                    <PlusCircle size={20} />
                    Novo Imóvel
                </Button>
            </div>
        </nav>
    );
}
