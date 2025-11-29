import { Home, PlusCircle, Users } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BottomNavProps {
    activeTab: 'home' | 'tenants' | 'new';
    onTabChange: (tab: 'home' | 'tenants' | 'new') => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe-area-inset-bottom z-50 md:hidden">
            <div className="flex justify-around items-center h-[80px]">
                <button
                    onClick={() => onTabChange('home')}
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full space-y-1",
                        activeTab === 'home' ? "text-blue-600" : "text-gray-500"
                    )}
                >
                    <Home size={32} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
                    <span className="text-sm font-medium">Início</span>
                </button>

                <button
                    onClick={() => onTabChange('tenants')}
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full space-y-1",
                        activeTab === 'tenants' ? "text-blue-600" : "text-gray-500"
                    )}
                >
                    <Users size={32} strokeWidth={activeTab === 'tenants' ? 2.5 : 2} />
                    <span className="text-sm font-medium">Inquilinos</span>
                </button>

                <button
                    onClick={() => onTabChange('new')}
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full space-y-1",
                        activeTab === 'new' ? "text-blue-600" : "text-gray-500"
                    )}
                >
                    <PlusCircle size={32} strokeWidth={activeTab === 'new' ? 2.5 : 2} />
                    <span className="text-sm font-medium">Novo</span>
                </button>
            </div>
        </nav>
    );
}
