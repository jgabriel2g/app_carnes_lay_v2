export interface PresentationUnit {
  id: number;
  name: string;
}

export interface TypeOfWeight {
  id: number;
  name: string;
}

export interface StockDetail {
  id: number;
  product: {
    id: number;
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
  id: number;
  product: {
    id: number;
    name: string;
    code: string;
  };
  presentation_unit: PresentationUnit;
  type_of_weight: TypeOfWeight;
  price: string;
  purchase: number;
  total_unit: number;
  weight: string;
  is_approved?: boolean;
  stock_details: StockDetail[];
}

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  is_inventory: boolean;
  is_tax: boolean;
  category: Category;
  stocks: Stock[];
  is_active: boolean;
}

