import {IdentificationType, PersonType} from "./global.model";
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
  person_type: PersonType;
  first_name: string;
  last_name: string;
  identification_type: IdentificationType;
  identification_number: string;
  digit_check: string;
  email: string;
  phone: string;
  address: string;
  municipality: Municipality;
  company_name: string;
  regime_type: RegimeType;
  responsibilities: Responsibilities;
}
