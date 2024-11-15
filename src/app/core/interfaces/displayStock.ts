export interface DisplayStock {
  id: string;
  lastQuantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    code: string;
    created: string
  }
  quantity: number;
  remainingPercentage: number;
  typeOfUnitMeasurement: {
    id: string;
    name: string;
  }
}

export interface getDisplayStockResponse {
  count: number;
  next?: string;
  previous?: string;
  results: DisplayStock[];
}
