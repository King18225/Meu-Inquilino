import type { Property } from '../types';

export async function requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
        console.log('This browser does not support desktop notification');
        return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
}

export function sendNotification(title: string, body: string) {
    if (Notification.permission === 'granted') {
        try {
            new Notification(title, {
                body,
                icon: '/pwa-192x192.png',
                vibrate: [200, 100, 200],
            } as any);
        } catch (e) {
            console.error('Error sending notification:', e);
        }
    }
}

export function checkAndSendAlerts(properties: Property[]) {
    if (Notification.permission !== 'granted') return;

    properties.forEach(property => {
        // 1. Check for Late Payments (> 5 days)
        if (property.status === 'late') {
            const today = new Date();
            const dueDate = new Date(property.dueDate);
            const diffTime = Math.abs(today.getTime() - dueDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays >= 5) {
                sendNotification(
                    "Aluguel Atrasado!",
                    `O aluguel de ${property.tenant.name} está atrasado há ${diffDays} dias.`
                );
            }
        }

        // 2. Check for Contract Expiration
        if (property.contractEnd) {
            const today = new Date();
            const endDate = new Date(property.contractEnd);
            const diffTime = endDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 30 || diffDays === 7 || diffDays === 0) {
                sendNotification(
                    "Contrato Vencendo",
                    `O contrato de ${property.tenant.name} vence em ${diffDays === 0 ? 'hoje' : diffDays + ' dias'}.`
                );
            }
        }
    });
}
