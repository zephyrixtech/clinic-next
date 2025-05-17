export interface Medicine {
  _id: string;
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  dosageForm: string;
  strength: string;
  quantity: number;
  unit: string;
  batchNumber: string;
  expiryDate: Date;
  reorderLevel: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicineStock {
  medicine: Medicine;
  quantity: number;
  status: 'normal' | 'low' | 'out_of_stock';
}

export interface MedicineFilter {
  category?: string;
  manufacturer?: string;
  lowStock?: boolean;
  expired?: boolean;
}