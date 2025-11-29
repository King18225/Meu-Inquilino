export type PaymentStatus = 'paid' | 'late' | 'due_today' | 'pending';

export interface Tenant {
    id: string;
    name: string;
    phone: string; // Formato para WhatsApp
}


export interface Property {
    id: string;
    address: string;
    tenant: Tenant;
    rentAmount: number;
    dueDate: string; // ISO Date
    status: PaymentStatus;
    contractStart?: string;
    contractEnd?: string;
}
