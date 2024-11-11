export interface SaleResponse {
  id: string;
  startTime: string;
  endTime: string;
  user: User;
  totalBills: number;
  baseMoney: number;
  totalSold: number;
  totalMoney: number;
  productsSummary: ProductSummary[];
  isMobile?: boolean;
}

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  identificationNumber: string;
  identificationType: string;
  groups: number[];
  requiredChangePassword: boolean;
}

export interface ProductSummary {
  productName: string;
  totalWeight: number;
  unit: string;
  price: number;
  totalPrice: number;
}
