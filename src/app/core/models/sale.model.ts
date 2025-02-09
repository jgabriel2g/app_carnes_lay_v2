import {User} from "./auth.model";
import { Client } from "./client.model";
import {PaymentMethod} from "./global.model";

export interface ProductSummary {
  productName: string;
  totalWeight: number;
  unit: string;
  price: number;
  totalPrice: number;
}

export interface Sale {
  id: string;
  user: User;
  base_money: number;
  start_time: string;
  end_time: string;
  total_bills: number;
  total_sold: number;
  total_money: number;
  products_summary: ProductSummary[];
  isMobile?: boolean;
}

export interface BillSummary {
  id: string;
  date: string;
  total_cost: number;
  payment_method: PaymentMethod;
  client: Client;
  is_approved: boolean;
  invoice_response: any;
}

export interface DisplayProduct {
  id: string;
  code: string;
  product: string;
  amount: string;
  price: string;
  type_of_unit_measurement: string;
}

export interface TotalUnitMeasurement {
  name: string;
  total: number;
}

export interface Bill {
  id: string;
  date: string;
  user: User;
  payment_method: PaymentMethod;
  total_cost: number;
  total_received: number;
  total_sent: number;
  sale: string;
  client: Client;
  display_products: DisplayProduct[];
  total_unit_measurements: { [key: string]: TotalUnitMeasurement };
  created: string;
}
