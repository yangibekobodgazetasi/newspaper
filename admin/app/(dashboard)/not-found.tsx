import NotFoundView from '@/components/ui/NotFoundView';

/**
 * Dashboard ichidagi sahifa `notFound()` chaqirganda (masalan mavjud bo'lmagan
 * yangilik id'si) shu ko'rinadi. Bu yerda shell allaqachon layout'dan keladi.
 */
export default function DashboardNotFound() {
  return <NotFoundView />;
}
