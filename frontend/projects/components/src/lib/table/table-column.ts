export interface TableColumn {
  key: string;
  label: string;
  numeric?: boolean;
  sortable?: boolean;
  firstSort?: 'ascending' | 'descending';
  actions?: boolean;
}
