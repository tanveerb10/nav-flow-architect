
export interface NavigationLink {
  label: string;
  url: string;
  position: number;
  _id: string;
}

export interface DropdownColumn {
  type: 'links' | 'image';
  title?: string;
  links: NavigationLink[];
  image?: {
    url: string;
    altText: string;
  };
  position: number;
  _id: string;
}

export interface DropdownData {
  menuTitle: string;
  columns: DropdownColumn[];
  _id: string;
}

export interface MenuDropdown {
  menuTitle: string;
  dropdown: DropdownData;
  _id: string;
}

export interface MenuItem {
  title: string;
  url: string;
  hasDropdown: boolean;
  position: number;
  _id: string;
}

export interface NavigationData {
  _id: string;
  menu: MenuItem[];
  dropdowns: MenuDropdown[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}
