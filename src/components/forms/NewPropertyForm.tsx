import { useForm, Controller } from 'react-hook-form';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

interface NewPropertyFormData {
    tenant_name: string;
    contact_phone: string;
    address: string;
    rent_amount: number;
    rent_due_day: number;
    contract_start: string;
    contract_end: string;
}

interface NewPropertyFormProps {
    initialData?: any; // Property to edit
    onSuccess: () => void;
    onCancel: () => void;
}

export function NewPropertyForm({ initialData, onSuccess, onCancel }: NewPropertyFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, control, formState: { errors }, reset, watch, setValue } = useForm<NewPropertyFormData>({
        defaultValues: {
            tenant_name: '',
            contact_phone: '',
            address: '',
            rent_amount: 0,
            rent_due_day: 1,
            contract_start: '',
            contract_end: '',
        }
    });

    const contractStart = watch('contract_start');

    // Auto-suggest contract end date (12 months)
    useEffect(() => {
        if (contractStart && !initialData) {
            const startDate = new Date(contractStart);
            const endDate = new Date(startDate);
            endDate.setFullYear(endDate.getFullYear() + 1); // Add 1 year
            endDate.setDate(endDate.getDate() - 1); // Minus 1 day
            setValue('contract_end', endDate.toISOString().split('T')[0]);
        }
    }, [contractStart, setValue, initialData]);

    useEffect(() => {
        if (initialData) {
            reset({
                tenant_name: initialData.tenant.name,
                contact_phone: initialData.tenant.phone,
                address: initialData.address,
                rent_amount: initialData.rentAmount,
                rent_due_day: parseInt(new Date(initialData.dueDate).getDate().toString()),
                contract_start: initialData.contractStart || '',
                contract_end: initialData.contractEnd || '',
            });
        }
    }, [initialData, reset]);

    const onSubmit = async (data: NewPropertyFormData) => {
        setIsLoading(true);
        try {
            // Clean phone number
            const cleanPhone = data.contact_phone.replace(/\D/g, '');
            const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

            const payload = {
                tenant_name: data.tenant_name,
                contact_phone: formattedPhone,
                address: data.address,
                rent_amount: data.rent_amount,
                rent_due_day: data.rent_due_day,
                contract_start: data.contract_start || null,
                contract_end: data.contract_end || null,
            };

            let error;

            if (initialData) {
                // Update
                const { error: updateError } = await supabase
                    .from('properties')
                    .update(payload)
                    .eq('id', initialData.id);
                error = updateError;
            } else {
                // Insert
                const { error: insertError } = await supabase
                    .from('properties')
                    .insert([payload]);
                error = insertError;
            }

            if (error) throw error;
            onSuccess();
        } catch (error) {
            console.error('Error saving property:', error);
            alert('Erro ao salvar imóvel. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!initialData) return;

        if (!confirm(`Tem certeza que deseja excluir o imóvel de ${initialData.tenant.name}? Essa ação não pode ser desfeita.`)) {
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('properties')
                .delete()
                .eq('id', initialData.id);

            if (error) throw error;
            onSuccess(); // Refresh list and close modal
        } catch (error) {
            console.error('Error deleting property:', error);
            alert('Erro ao excluir imóvel.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatPhone = (value: string) => {
        if (!value) return "";
        const digits = value.replace(/\D/g, '');
        const d = digits.slice(0, 11);
        if (d.length <= 2) return d;
        if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
        return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <label className="block text-lg font-bold text-gray-700 mb-2">Nome do Inquilino</label>
                <input
                    {...register('tenant_name', { required: true })}
                    placeholder="Ex: Sr. João Silva"
                    className="w-full h-14 px-4 rounded-xl border border-gray-300 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
                {errors.tenant_name && <span className="text-red-500 text-sm">Nome é obrigatório</span>}
            </div>

            <div>
                <label className="block text-lg font-bold text-gray-700 mb-2">WhatsApp / Telefone</label>
                <Controller
                    name="contact_phone"
                    control={control}
                    rules={{ required: true, minLength: 14 }}
                    render={({ field: { onChange, value } }) => (
                        <input
                            value={value || ''}
                            onChange={(e) => onChange(formatPhone(e.target.value))}
                            placeholder="(11) 99999-9999"
                            inputMode="tel"
                            className="w-full h-14 px-4 rounded-xl border border-gray-300 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        />
                    )}
                />
                {errors.contact_phone && <span className="text-red-500 text-sm">Telefone inválido</span>}
            </div>

            <div>
                <label className="block text-lg font-bold text-gray-700 mb-2">Endereço do Imóvel</label>
                <input
                    {...register('address', { required: true })}
                    placeholder="Rua, Número, Complemento"
                    className="w-full h-14 px-4 rounded-xl border border-gray-300 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
                {errors.address && <span className="text-red-500 text-sm">Endereço é obrigatório</span>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-lg font-bold text-gray-700 mb-2">Valor (R$)</label>
                    <input
                        {...register('rent_amount', { required: true, min: 1 })}
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        className="w-full h-14 px-4 rounded-xl border border-gray-300 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-lg font-bold text-gray-700 mb-2">Dia Venc.</label>
                    <input
                        {...register('rent_due_day', { required: true, min: 1, max: 31 })}
                        type="number"
                        placeholder="Dia"
                        className="w-full h-14 px-4 rounded-xl border border-gray-300 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-2">
                <div>
                    <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Início do Contrato</label>
                    <input
                        {...register('contract_start')}
                        type="date"
                        className="w-full h-12 px-4 rounded-xl border border-gray-300 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Fim do Contrato</label>
                    <input
                        {...register('contract_end')}
                        type="date"
                        className="w-full h-12 px-4 rounded-xl border border-gray-300 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="pt-4 space-y-3">
                <Button
                    type="submit"
                    variant="success"
                    size="lg"
                    fullWidth
                    disabled={isLoading}
                >
                    {isLoading ? 'SALVANDO...' : (initialData ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR IMÓVEL')}
                </Button>

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="w-full py-3 text-gray-500 font-medium text-lg hover:text-gray-700"
                >
                    Cancelar
                </button>

                {initialData && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="w-full py-3 text-red-500 font-medium text-lg hover:text-red-700 flex items-center justify-center gap-2 mt-4"
                    >
                        <Trash2 size={20} />
                        Excluir Imóvel
                    </button>
                )}
            </div>
        </form>
    );
}
