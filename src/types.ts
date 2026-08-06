export interface SetEntity {
  id: number;
  name: string;
  parentSetsEntityId: number | null;
  dirty: boolean;
  children?: SetEntity[];
}

export interface ItemEntity {
  id: number;
  fileName: string;
  completeFileName: string;
  fileSize: number;
  setsEntityId: number | null;
  enabled: boolean;
  packageType: string;
  casCategories?: string;
  casAge?: string;
  casGender?: string;
  casOutfitCategory?: string;
  isUserTagged?: boolean;
  userTags?: string;
  installDate?: string;
}

export interface Configuration {
  id: number;
  name: string;
  description?: string | null;
  default: boolean;
  active: boolean;
  setIds: number[];
}

export interface ContextMenuItem {
  label: string;
  icon?: string;
  danger?: boolean;
  divider?: boolean;
  action?: () => void;
}
