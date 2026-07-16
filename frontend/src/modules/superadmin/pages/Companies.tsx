import { useState } from 'react';
import { Filter } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { PageContainer } from '../../../components/layout/PageContainer';
import { PageBody } from '../../../components/layout/PageBody';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import { SearchBar } from '../../../components/ui/SearchBar';
import { StatusBadge } from '../../../components/ui/StatusBadge';

interface Company {
  id: string;
  name: string;
  plan: string;
  status: 'active' | 'inactive' | 'suspended';
  mrr: number;
  users: number;
  createdAt: string;
  paymentStatus: 'paid' | 'pending' | 'overdue';
}

const mockCompanies: Company[] = [
  { id: 'COMP-001', name: 'Empresa ABC', plan: 'Professional', status: 'active', mrr: 79, users: 5, createdAt: '2024-01-10', paymentStatus: 'paid' },
  { id: 'COMP-002', name: 'Empresa XYZ', plan: 'Enterprise', status: 'active', mrr: 199, users: 15, createdAt: '2024-01-08', paymentStatus: 'paid' },
  { id: 'COMP-003', name: 'Empresa 123', plan: 'Starter', status: 'inactive', mrr: 29, users: 2, createdAt: '2024-01-05', paymentStatus: 'pending' },
  { id: 'COMP-004', name: 'Empresa 456', plan: 'Professional', status: 'suspended', mrr: 79, users: 8, createdAt: '2024-01-01', paymentStatus: 'overdue' },
];

export const Companies = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const columns = [
    { key: 'name', header: 'Empresa' },
    { key: 'plan', header: 'Plan' },
    { key: 'status', header: 'Estado', render: (value: string) => <StatusBadge status={value} /> },
    { key: 'mrr', header: 'MRR', render: (value: number) => `$${value}` },
    { key: 'users', header: 'Usuarios' },
    { key: 'paymentStatus', header: 'Pago', render: (value: string) => <StatusBadge status={value} /> },
    { key: 'createdAt', header: 'Creado' },
  ];

  const filteredCompanies = mockCompanies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageContainer>
      <PageHeader title="Todas las Empresas" description="Vista global de todas las empresas del sistema" />
      <PageBody>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <SearchBar
                placeholder="Buscar empresas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
              />
              <Button variant="outline" size="sm" leftIcon={<Filter className="w-4 h-4" />}>Filtros</Button>
            </div>
          </div>
          <DataTable
            data={filteredCompanies}
            columns={columns}
            pagination={{ currentPage, totalPages: Math.ceil(filteredCompanies.length / 10), onPageChange: setCurrentPage }}
          />
        </Card>
      </PageBody>
    </PageContainer>
  );
};
