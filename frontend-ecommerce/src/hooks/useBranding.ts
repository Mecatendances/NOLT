import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../services/api';

export function useBranding(shopId?: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['branding', shopId],
    queryFn: () => adminApi.getBrandingSettings(shopId ? { shopId } : undefined).then(res => res.data),
  });
  return {
    branding: data,
    isLoading,
    error,
  };
} 