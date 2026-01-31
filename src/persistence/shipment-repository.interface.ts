import { Shipment } from '../domain/shipment';

export interface ShipmentRepository {
  save(shipment: Shipment): Promise<void>;
  findAll(): Promise<Shipment[]>;
  saveAll?(shipments: Shipment[]): Promise<void>;
  verifyUser?(username: string, password: string): Promise<boolean>;
}
