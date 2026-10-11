import type { IconName } from '../icon/icon-name';

export interface MenuItemEntry {
  kind: 'item';
  id: string;
  label: string;
  href?: string;
  icon?: IconName;
  danger?: boolean;
}
