import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Copy } from 'lucide-react';
import { PageLoader } from '../../../components/layout/PageLoader';
import { PageHeader } from '../../../components/layout/PageHeader';
import { PageContainer } from '../../../components/layout/PageContainer';
import { PageBody } from '../../../components/layout/PageBody';
import { DataTable } from '../../../components/ui/DataTable';
import { SearchBar } from '../../../components/ui/SearchBar';
import { FilterSelect } from '../../../components/ui/FilterSelect';
import { ViewToggle, ViewMode } from '../../../components/ui/ViewToggle';
import { HeaderButton } from '../../../components/ui/HeaderButton';
import { CountBadge } from '../../../components/ui/CountBadge';
import { TableCard } from '../../../components/ui/TableCard';
import { KebabMenu } from '../../../components/ui/KebabMenu';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { CatalogEditor } from '../components/CatalogEditor';
import { getCatalogs, createCatalog, updateCatalog, deleteCatalog, uploadProductMedia } from '../../../services/api';
import { useNotifications } from '../../../contexts/NotificationContext';

export const Catalogs = () => {
  const [catalogs, setCatalogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>();
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  useEffect(() => {
    fetchCatalogs();
  }, []);

  const fetchCatalogs = async () => {
    try {
      setLoading(true);
      const data = await getCatalogs();
      setCatalogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch catalogs', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCatalog({ name: '', description: '', status: 'draft', items: [] });
    setIsEditorOpen(true);
  };

  const handleEdit = (catalog: any) => {
    setEditingCatalog(catalog);
    setIsEditorOpen(true);
  };

  const handleSave = async (catalog: any) => {
    try {
      setSaving(true);
      if (catalog.id) {
        await updateCatalog(catalog.id, catalog);
      } else {
        await createCatalog(catalog);
      }
      setIsEditorOpen(false);
      await fetchCatalogs();
    } catch (error) {
      console.error('Failed to save catalog', error);
      addNotification({ type: 'error', title: 'Error', message: 'No se pudo guardar el catálogo.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setLoading(true);
      await deleteCatalog(deleteTarget);
      await fetchCatalogs();
    } catch (error) {
      console.error('Failed to delete catalog', error);
      addNotification({ type: 'error', title: 'Error', message: 'No se pudo eliminar el catálogo.' });
    } finally {
      setLoading(false);
      setDeleteTarget(null);
    }
  };

  const handleImageUpload = async (itemId: string, file: File): Promise<string | null> => {
    try {
      const url = await uploadProductMedia(file);
      return url as string;
    } catch (error) {
      console.error('Upload failed', error);
      addNotification({ type: 'error', title: 'Error de imagen', message: 'Verifica el tamaño (máx 10MB) o el almacenamiento.' });
      return null;
    }
  };

  if (loading && catalogs.length === 0) return <PageLoader sectionName="Catálogos" />;

  const filteredCatalogs = (catalogs || []).filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedCatalogs = filteredCatalogs.slice((currentPage - 1) * 10, currentPage * 10);

  const columns = [
    { key: 'name', header: 'Nombre' },
    {
      key: 'description',
      header: 'Descripción',
      render: (value: string) => value ? (value.length > 50 ? value.substring(0, 50) + '...' : value) : '-'
    },
    {
      key: 'items',
      header: 'Items',
      render: (_: any, row: any) => `${row.items?.length || 0} items`
    },
    {
      key: 'status',
      header: 'Estado',
      render: (value: string) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${value === 'active' ? 'bg-accent-500/10 text-accent-600 dark:text-accent-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
          {value === 'active' ? 'Activo' : 'Borrador'}
        </span>
      )
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      render: (_: any, catalog: any) => (
        <KebabMenu actions={[
          { label: 'Editar', icon: <Edit className="w-3.5 h-3.5" />, onClick: (e) => { e.stopPropagation(); handleEdit(catalog); } },
          { label: 'Duplicar', icon: <Copy className="w-3.5 h-3.5" />, onClick: (e) => e.stopPropagation() },
          { label: 'Eliminar', icon: <Trash2 className="w-3.5 h-3.5" />, onClick: (e) => { e.stopPropagation(); setDeleteTarget(catalog.id); }, variant: 'danger' },
        ]} />
      )
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Catálogos"
        description="Gestiona productos e inventario"
        action={
          <div className="flex items-center gap-3">
            <CountBadge count={catalogs.length} />
            <HeaderButton onClick={handleCreate} icon={<Plus className="w-4 h-4" />}>
              Nuevo Catálogo
            </HeaderButton>
          </div>
        }
      />
      <PageBody>
        <TableCard>
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <SearchBar
              placeholder="Buscar catálogos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex flex-wrap items-center gap-3">
              <FilterSelect
                value={filterStatus}
                onChange={setFilterStatus}
                options={[
                  { value: 'all', label: 'Todos los estados' },
                  { value: 'active', label: 'Activo' },
                  { value: 'inactive', label: 'Inactivo' },
                ]}
              />
            </div>
          </div>

          <DataTable
            data={paginatedCatalogs}
            columns={columns}
            pagination={{
              currentPage,
              totalPages: Math.ceil(filteredCatalogs.length / 10) || 1,
              onPageChange: setCurrentPage,
            }}
          />
        </TableCard>
      </PageBody>

      <CatalogEditor
        open={isEditorOpen}
        catalog={editingCatalog}
        onSave={handleSave}
        onClose={() => setIsEditorOpen(false)}
        onImageUpload={handleImageUpload}
        loading={saving}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar Catálogo"
        message="¿Estás seguro de eliminar este catálogo? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        variant="danger"
      />
    </PageContainer>
  );
};

export default Catalogs;
