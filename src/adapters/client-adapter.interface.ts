import { Shipment } from '../domain/shipment';

export interface ClientAdapter<T> {
  supports(clientType: string): boolean;
  standardise(payload: T): Shipment;
  validate(payload: any): T;
}
