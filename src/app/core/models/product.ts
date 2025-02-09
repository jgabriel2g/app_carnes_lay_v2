export interface PresentationUnit {
  id: string;
  name: string;
}

export interface TypeOfWeight {
  id: string;
  name: string;
}

export interface StockDetail {
  id: string;
  product: {
    id: string;
    name: string;
    code: string;
  };
  stock: number;
  unit: number;
  type_of_unit: PresentationUnit;
  weight: string;
  type_of_weight: TypeOfWeight;
}

export interface Stock {
  id: string;
  product: {
    id: string;
    name: string;
    code: string;
  };
  quantity_of_unit: number;
  presentation_unit: PresentationUnit;
  quantity_available: number;
  type_of_weight: TypeOfWeight;
  price: string;
  purchase: number;
  total_unit: number;
  weight: string;
  is_approved?: boolean;
  stock_details: StockDetail[];
  created:string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  is_inventory: boolean;
  is_tax: boolean;
  category: Category;
  stocks: Stock[];
  is_active: boolean;
}
