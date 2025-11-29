import { Bell, BellRing, BellOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { requestNotificationPermission, sendNotification } from '../../lib/notifications';

export function NotificationButton() {
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const handleRequestPermission = async () => {
        const granted = await requestNotificationPermission();
        if (granted) {
            setPermission('granted');
            sendNotification("Tudo pronto! 🔔", "Agora eu vou te lembrar das cobranças por aqui.");
        } else {
            setPermission('denied');
        }
    };

    if (!('Notification' in window)) return null;

    if (permission === 'granted') {
        return (
            <button
                disabled
                className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-bold opacity-80 cursor-default"
            >
                <BellRing size={14} />
                Avisos Ativados
            </button>
        );
    }

    if (permission === 'denied') {
        return (
            <button
                disabled
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-full text-xs font-bold cursor-default"
            >
                <BellOff size={14} />
                Sem Permissão
            </button>
        );
    }

    return (
        <button
            onClick={handleRequestPermission}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-full text-xs font-bold transition-colors animate-pulse"
        >
            <Bell size={14} />
            Ativar avisos no celular
        </button>
    );
}
