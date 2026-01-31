import { ClientAAdapter } from './client-a.adapter';
import { ShipmentStatus } from '../domain/shipment';

describe('ClientAAdapter', () => {
  const adapter = new ClientAAdapter();

  const validPayload = {
    shipmentReference: 'REF123',
    originPortCode: 'PORT1',
    destinationPortCode: 'PORT2',
    departureEstimate: '2026-01-01T00:00:00Z',
    arrivalEstimate: '2026-01-02T00:00:00Z',
    cargoWeightKg: 1000,
    shipmentState: ShipmentStatus.BOOKED,
  };

  it('should support client-a', () => {
    expect(adapter.supports('client-a')).toBe(true);
    expect(adapter.supports('client-b')).toBe(false);
  });

  it('should validate a valid payload', () => {
    expect(() => adapter.validate(validPayload)).not.toThrow();
  });

  it('should throw error for invalid payload', () => {
    expect(() => adapter.validate({ ...validPayload, cargoWeightKg: 'not-a-number' })).toThrow();
  });

  it('should standardise data correctly', () => {
    const result = adapter.standardise(validPayload);
    expect(result).toEqual({
      shipment_id: 'REF123',
      origin_port: 'PORT1',
      destination_port: 'PORT2',
      etd: '2026-01-01T00:00:00Z',
      eta: '2026-01-02T00:00:00Z',
      weight: 1000,
      status: ShipmentStatus.BOOKED,
    });
  });
});
