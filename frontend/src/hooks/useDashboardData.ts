// hooks/useDashboardData.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface DashboardStats {
  totalUsers?: number;
  totalOrganizations?: number;
  totalNumbers?: number;
  activeConversations?: number;
  messagesToday?: number;
  monthlyRevenue?: number;
}

export const useDashboardData = () => {
  const { isSuperAdmin, isCompanyAdmin, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [isSuperAdmin, isCompanyAdmin, user?.organization_id]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      let endpoint = '/api/dashboard';
      
      if (isSuperAdmin) {
        endpoint = '/api/dashboard/super-admin/dashboard';
      } else if (isCompanyAdmin) {
        endpoint = `/api/dashboard/company/${user?.organization_id}/dashboard`;
      } else {
        endpoint = `/api/dashboard/user/${user?.id}/dashboard`;
      }

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setError(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, refetch: fetchDashboardData };
};
