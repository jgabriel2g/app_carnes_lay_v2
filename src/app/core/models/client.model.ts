import {IdentificationType} from "./global.model";
import {Municipality} from "./location.model";

export interface Responsibilities {
  id: string;
  code: string;
  name: string;
}

export interface RegimeType {
  id: string;
  code: string;
  name: string;
}

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  person_type: string;
  identification_type: IdentificationType;
  identification_number: string;
  digit_check: string;
  email: string;
  phone: string;
  address: string;
  company_name: string;
  municipality: Municipality;
  regime_type: RegimeType;
  responsibilities: Responsibilities;
}
