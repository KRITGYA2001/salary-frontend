import { ChartBar, UsersThree, type Icon } from '@phosphor-icons/react';

export interface NavItem {
  label: string;
  path: string;
  icon: Icon;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Employees', path: '/employees', icon: UsersThree },
  { label: 'Insights', path: '/insights', icon: ChartBar },
];
