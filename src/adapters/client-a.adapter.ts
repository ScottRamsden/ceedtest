import { z } from 'zod';
import { Shipment, ShipmentStatus } from '../domain/shipment';
import { ClientAdapter } from './client-adapter.interface';

export const ClientASchema = z.object({
  shipmentReference: z.string(),
  originPortCode: z.string(),
  destinationPortCode: z.string(),
  departureEstimate: z.string(),
  arrivalEstimate: z.string(),
  cargoWeightKg: z.number(),
  shipmentState: z.nativeEnum(ShipmentStatus),
});

export type ClientAPayload = z.infer<typeof ClientASchema>;

export class ClientAAdapter implements ClientAdapter<ClientAPayload> {
  supports(clientType: string): boolean {
    return clientType === 'client-a';
  }

  validate(payload: any): ClientAPayload {
    return ClientASchema.parse(payload);
  }

  standardise(payload: ClientAPayload): Shipment {
    return {
      shipment_id: payload.shipmentReference,
      origin_port: payload.originPortCode,
      destination_port: payload.destinationPortCode,
      etd: payload.departureEstimate,
      eta: payload.arrivalEstimate,
      weight: payload.cargoWeightKg,
      status: payload.shipmentState,
    };
  }
}
