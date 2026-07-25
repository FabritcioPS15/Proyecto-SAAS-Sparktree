import { useState } from 'react';
import { Activity } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { PageContainer } from '../../../components/layout/PageContainer';
import { PageBody } from '../../../components/layout/PageBody';
import { DataTable } from '../../../components/ui/DataTable';
import { SearchBar } from '../../../components/ui/SearchBar';
import { FilterSelect } from '../../../components/ui/FilterSelect';
import { ViewToggle, ViewMode } from '../../../components/ui/ViewToggle';
import { TableCard } from '../../../components/ui/TableCard';
import { GridCard } from '../../../components/ui/GridCard';
import { Badge } from '../../../components/ui/Badge';

interface AuditLog {
  id: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  timestamp: string;
  ip: string;
}

const mockLogs: AuditLog[] = [
  { id: 'LOG-001', user: 'admin@sparktree.io', action: 'CREATE', resource: 'Order', details: 'Created order ORD-001', timestamp: '2024-01-15 10:30:00', ip: '192.168.1.100' },
  { id: 'LOG-002', user: 'maria@empresa.com', action: 'UPDATE', resource: 'Client', details: 'Updated client CLT-002', timestamp: '2024-01-15 09:45:00', ip: '192.168.1.101' },
  { id: 'LOG-003', user: 'juan@empresa.com', action: 'DELETE', resource: 'Promotion', details: 'Deleted promotion PROM-003', timestamp: '2024-01-15 08:15:00', ip: '192.168.1.102' },
  { id: 'LOG-004', user: 'admin@sparktree.io', action: 'LOGIN', resource: 'Auth', details: 'User logged in', timestamp: '2024-01-15 08:00:00', ip: '192.168.1.100' },
];

const ACTION_VARIANTS: Record<string, 'success' | 'info' | 'danger' | 'default'> = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'danger',
  LOGIN: 'default',
};

export const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentPage, setCurrentPage] = useState(1);

  const columns = [
    { key: 'timestamp', header: 'Fecha/Hora' },
    { key: 'user', header: 'Usuario' },
    { key: 'action', header: 'Acción' },
    { key: 'resource', header: 'Recurso' },
    { key: 'details', header: 'Detalles', render: (value: string) => value.substring(0, 40) + '...' },
    { key: 'ip', header: 'IP' },
  ];

  const filtered = mockLogs.filter(l =>
    (l.user.toLowerCase().includes(searchTerm.toLowerCase()) || l.action.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterAction === 'all' || l.action === filterAction)
  );

  return (
    <PageContainer>
      <PageHeader
        title="Auditoría"
        description="Logs de acciones por usuario/empresa"
      />
      <PageBody>
        <TableCard>
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <SearchBar
              placeholder="Buscar por usuario o acción..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
            <div className="flex flex-wrap items-center gap-3">
              <FilterSelect
                value={filterAction}
                onChange={(v) => { setFilterAction(v); setCurrentPage(1); }}
                options={[
                  { value: 'all', label: 'Todas las acciones' },
                  { value: 'CREATE', label: 'Crear' },
                  { value: 'UPDATE', label: 'Actualizar' },
                  { value: 'DELETE', label: 'Eliminar' },
                  { value: 'LOGIN', label: 'Login' },
                ]}
              />
              <ViewToggle value={viewMode} onChange={setViewMode} />
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((log) => (
                <GridCard
                  key={log.id}
                  icon={<Activity className="w-5 h-5" />}
                  title={log.resource}
                  subtitle={log.details}
                  status={
                    <Badge variant={ACTION_VARIANTS[log.action] || 'default'} size="xs">
                      {log.action}
                    </Badge>
                  }
                  actions={
                    <>
                      <span className="font-medium truncate max-w-[120px] text-[10px] text-slate-400">{log.user}</span>
                      <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                    </>
                  }
                />
              ))}
            </div>
          ) : (
            <DataTable
              data={filtered}
              columns={columns}
              pagination={{ currentPage, totalPages: Math.ceil(filtered.length / 10) || 1, onPageChange: setCurrentPage }}
            />
          )}
        </TableCard>
      </PageBody>
    </PageContainer>
  );
};
