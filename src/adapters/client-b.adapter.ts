import { z } from 'zod';
import { Shipment, ShipmentStatus } from '../domain/shipment';
import { ClientAdapter } from './client-adapter.interface';

export const ClientBSchema = z.object({
  id: z.string(),
  route: z.object({
    pol: z.string(),
    pod: z.string(),
  }),
  schedule: z.object({
    etd: z.string(),
    eta: z.string(),
  }),
  metrics: z.object({
    weight: z.number(),
  }),
  status_code: z.string(),
});

export type ClientBPayload = z.infer<typeof ClientBSchema>;

export class ClientBAdapter implements ClientAdapter<ClientBPayload> {
  supports(clientType: string): boolean {
    return clientType === 'client-b';
  }

  validate(payload: any): ClientBPayload {
    return ClientBSchema.parse(payload);
  }

  private mapStatus(status: string): ShipmentStatus {
    const mapping: Record<string, ShipmentStatus> = {
      'INTRANSIT': ShipmentStatus.IN_TRANSIT,
      'BOOKED': ShipmentStatus.BOOKED,
      'DEPARTED': ShipmentStatus.DEPARTED,
      'ARRIVED': ShipmentStatus.ARRIVED,
    };
    return mapping[status] || ShipmentStatus.BOOKED;
  }

  standardise(payload: ClientBPayload): Shipment {
    return {
      shipment_id: payload.id,
      origin_port: payload.route.pol,
      destination_port: payload.route.pod,
      etd: payload.schedule.etd,
      eta: payload.schedule.eta,
      weight: payload.metrics.weight,
      status: this.mapStatus(payload.status_code),
    };
  }
}
