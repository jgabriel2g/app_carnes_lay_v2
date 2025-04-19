export interface MetricProduct {
  code: string;
  product_name: string;
  total_quantity: number;
  type_of_unit_measurement: string;
  unit_price: number;
  total_sold: number;
}

export interface MetricQuantityByUnit {
  unity: string;
  total: number;
}

export interface MetricResponse {
  start_date: string;
  end_date: string;
  total_sold: number;
  products: MetricProduct[];
  count: number;
  quantity_by_unit: MetricQuantityByUnit[];
  next: string | null;
  previous: string | null;
}
