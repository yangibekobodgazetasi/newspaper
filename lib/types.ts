/** Backenddan keladigan paginatsiyalangan javoblarning umumiy konverti. */
export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}
