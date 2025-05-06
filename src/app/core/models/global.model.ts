export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

export interface IdentificationType {
  id: number;
  name: string;
  code: string;
}

export interface PaymentMethod {
  id: string | null;
  name: string;
  is_payable: boolean;
}

export interface PersonType {
  id: string;
  name: string;
}
