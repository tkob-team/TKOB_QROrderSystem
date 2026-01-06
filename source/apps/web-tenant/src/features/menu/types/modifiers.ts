export interface ModifierOption {
  id?: string;
  name: string;
  priceDelta: number;
  displayOrder?: number;
  active?: boolean;
}

export interface ModifierGroup {
  id: string;
  name: string;
  description?: string;
  displayOrder?: number;
  options: ModifierOption[];
  linkedItems?: number;
  type: 'single' | 'multiple' | 'SINGLE_CHOICE' | 'MULTI_CHOICE';
  required: boolean;
  minChoices?: number;
  maxChoices?: number;
  active?: boolean;
}

export interface FormOption {
  id?: string;
  name: string;
  priceDelta: number;
  displayOrder: number;
  active: boolean;
}
