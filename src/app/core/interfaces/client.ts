export interface Client {

}

export interface getClientResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Client[];
}
