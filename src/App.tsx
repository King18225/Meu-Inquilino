import { useState, useEffect } from 'react';
import type { Property, PaymentStatus } from './types';
import { BottomNav } from './components/layout/BottomNav';
import { TopNav } from './components/layout/TopNav';
import { Dashboard } from './pages/Dashboard';
import { PropertyDetail } from './pages/PropertyDetail';
import { TenantsList } from './pages/TenantsList'; // Import TenantsList
import { TenantDetailModal } from './components/modals/TenantDetailModal'; // Import TenantDetailModal
import { Button } from './components/ui/Button';

import { Modal } from './components/ui/Modal';
import { NewPropertyForm } from './components/forms/NewPropertyForm';
import { supabase } from './lib/supabase';
import { Home } from 'lucide-react';
import { checkAndSendAlerts } from './lib/notifications';

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'tenants' | 'new'>('home'); // Update type
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isNewPropertyModalOpen, setIsNewPropertyModalOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTenantName, setSelectedTenantName] = useState<string | null>(null); // State for selected tenant

  // Helper to calculate status based on payments
  const calculateStatus = (rentDueDay: number, payments: any[]): PaymentStatus => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();

    // Check if there is a payment for this month/year
    const hasPaidThisMonth = payments.some(p => {
      const paymentDate = new Date(p.due_date);
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear && p.status === 'paid';
    });

    if (hasPaidThisMonth) return 'paid';

    if (currentDay > rentDueDay) return 'late';
    if (currentDay === rentDueDay) return 'due_today';
    return 'pending';
  };

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Properties
      const { data: propertiesData, error: propError } = await supabase
        .from('properties')
        .select('*');

      if (propError) throw propError;

      // 2. Fetch Payments for current month (to determine status)
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString();

      const { data: paymentsData, error: payError } = await supabase
        .from('payments')
        .select('*')
        .gte('due_date', startOfMonth)
        .lte('due_date', endOfMonth);

      if (payError) throw payError;

      if (propertiesData) {
        const mappedProperties: Property[] = propertiesData.map((p: any) => {
          // Filter payments for this property
          const propertyPayments = paymentsData ? paymentsData.filter((pay: any) => pay.property_id === p.id) : [];

          return {
            id: p.id,
            address: p.address,
            tenant: {
              id: p.id,
              name: p.tenant_name,
              phone: p.contact_phone,
            },
            rentAmount: p.rent_amount,
            dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), p.rent_due_day).toISOString(),
            status: calculateStatus(p.rent_due_day, propertyPayments),
            contractStart: p.contract_start,
            contractEnd: p.contract_end,
          };
        });

        // Sort: Late (0) > Due Today (1) > Pending (2) > Paid (3)
        const statusPriority = { late: 0, due_today: 1, pending: 2, paid: 3 };
        mappedProperties.sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);

        setProperties(mappedProperties);
        checkAndSendAlerts(mappedProperties);
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleTabChange = (tab: 'home' | 'tenants' | 'new') => {
    if (tab === 'new') {
      setPropertyToEdit(null);
      setIsNewPropertyModalOpen(true);
    } else {
      setActiveTab(tab);
    }
  };

  const handleNewPropertySuccess = () => {
    setIsNewPropertyModalOpen(false);
    setPropertyToEdit(null);
    setSelectedProperty(null);
    fetchProperties();
    setActiveTab('home');
  };

  const handleEditProperty = (property: Property) => {
    setPropertyToEdit(property);
    setIsNewPropertyModalOpen(true);
  };

  const handleMarkAsPaid = (id: string) => {
    // Optimistic update
    setProperties(prev => {
      const updated = prev.map(p => {
        if (p.id === id) {
          return { ...p, status: 'paid' as PaymentStatus };
        }
        return p;
      });
      const statusPriority = { late: 0, due_today: 1, pending: 2, paid: 3 };
      updated.sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);
      return updated;
    });

    if (selectedProperty && selectedProperty.id === id) {
      setSelectedProperty(prev => prev ? { ...prev, status: 'paid' } : null);
    }
  };

  // Calculate Financial Summary
  const financialSummary = properties.reduce(
    (acc, curr) => {
      if (curr.status === 'paid') {
        acc.received += curr.rentAmount;
      } else {
        acc.toReceive += curr.rentAmount;
      }
      return acc;
    },
    { received: 0, toReceive: 0 }
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (selectedProperty) {
      return (
        <PropertyDetail
          property={selectedProperty}
          onBack={() => setSelectedProperty(null)}
          onMarkAsPaid={handleMarkAsPaid}
          onEdit={handleEditProperty}
        />
      );
    }

    if (activeTab === 'tenants') {
      return (
        <TenantsList
          properties={properties}
          onSelectTenant={setSelectedTenantName}
        />
      );
    }

    if (properties.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[80vh] px-6 text-center">
          <div className="bg-gray-100 p-6 rounded-full mb-6">
            <Home size={64} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Nenhum imóvel cadastrado</h2>
          <p className="text-gray-500 mb-8 text-lg">Comece cadastrando seu primeiro aluguel para organizar seus recebimentos.</p>
          <Button
            onClick={() => setIsNewPropertyModalOpen(true)}
            size="lg"
            fullWidth
          >
            CADASTRAR MEU PRIMEIRO ALUGUEL
          </Button>
        </div>
      )
    }

    return (
      <Dashboard
        properties={properties}
        onSelectProperty={setSelectedProperty}
        financialSummary={financialSummary}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans">
      <TopNav activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="max-w-7xl mx-auto bg-white min-h-screen shadow-lg relative md:shadow-none md:bg-transparent md:px-6">
        {renderContent()}

        {!selectedProperty && (
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        )}
      </main>

      <Modal
        isOpen={isNewPropertyModalOpen}
        onClose={() => setIsNewPropertyModalOpen(false)}
        title={propertyToEdit ? "Editar Imóvel" : "Novo Imóvel"}
      >
        <NewPropertyForm
          initialData={propertyToEdit}
          onSuccess={handleNewPropertySuccess}
          onCancel={() => setIsNewPropertyModalOpen(false)}
        />
      </Modal>

      <TenantDetailModal
        isOpen={!!selectedTenantName}
        onClose={() => setSelectedTenantName(null)}
        tenantName={selectedTenantName}
        properties={properties}
      />
    </div>
  );
}

export default App;
