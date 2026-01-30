export enum ShipmentStatus {
  BOOKED = 'BOOKED',
  IN_TRANSIT = 'IN_TRANSIT',
  DEPARTED = 'DEPARTED',
  ARRIVED = 'ARRIVED',
}

export interface Shipment {
  shipment_id: string;
  origin_port: string;
  destination_port: string;
  etd: string;
  eta: string;
  weight: number;
  status: ShipmentStatus;
}
