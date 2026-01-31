import { ClientBAdapter } from './client-b.adapter';
import { ShipmentStatus } from '../domain/shipment';

describe('ClientBAdapter', () => {
  const adapter = new ClientBAdapter();

  const validPayload = {
    id: 'REF456',
    route: {
      pol: 'PORT-A',
      pod: 'PORT-B',
    },
    schedule: {
      etd: '2026-02-01',
      eta: '2026-02-05',
    },
    metrics: {
      weight: 5000,
    },
    status_code: 'INTRANSIT',
  };

  it('should support client-b', () => {
    expect(adapter.supports('client-b')).toBe(true);
    expect(adapter.supports('client-a')).toBe(false);
  });

  it('should validate a valid payload', () => {
    expect(() => adapter.validate(validPayload)).not.toThrow();
  });

  it('should standardise data correctly', () => {
    const result = adapter.standardise(validPayload);
    expect(result).toEqual({
      shipment_id: 'REF456',
      origin_port: 'PORT-A',
      destination_port: 'PORT-B',
      etd: '2026-02-01',
      eta: '2026-02-05',
      weight: 5000,
      status: ShipmentStatus.IN_TRANSIT,
    });
  });

  it('should map unknown status to BOOKED', () => {
    const payloadWithUnknownStatus = { ...validPayload, status_code: 'UNKNOWN' };
    const result = adapter.standardise(payloadWithUnknownStatus);
    expect(result.status).toBe(ShipmentStatus.BOOKED);
  });
});
