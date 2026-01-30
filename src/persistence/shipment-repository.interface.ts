import { Shipment } from '../domain/shipment';

export interface ShipmentRepository {
  save(shipment: Shipment): Promise<void>;
  findAll(): Promise<Shipment[]>;
}
