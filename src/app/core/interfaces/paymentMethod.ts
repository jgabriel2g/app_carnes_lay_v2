export interface PaymentMethod {
  id: string;
  name: string;
}

export interface getPaymentMethodResponse {
  count: number;
  next?: string;
  previous?: string;
  results: PaymentMethod[];
}
