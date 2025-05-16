import { IdentificationType, PersonType } from './global.model';
import { Municipality } from './location.model';

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

export interface ClientRequest {
  person_type: string;
  first_name: string;
  last_name: string;
  identification_type: string;
  identification_number: string;
  email: string;
  phone: string;
  address: string;
  municipality: string;
  company_name: string;
  regime_type: string;
  responsibilities: string;
}

export type PartialClientRequest = Partial<ClientRequest>;

export type ProviderRequest = ClientRequest;
export type PartialProviderRequest = Partial<ProviderRequest>;
