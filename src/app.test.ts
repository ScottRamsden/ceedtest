import request from 'supertest';
import { createShipmentApp } from './app';
import { ShipmentRepository } from './persistence';
import { Shipment, ShipmentStatus } from './domain/shipment';

describe('API Integration Tests', () => {
  let mockRepository: jest.Mocked<ShipmentRepository>;
  let app: any;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findAll: jest.fn().mockResolvedValue([])
    };
    app = createShipmentApp(mockRepository);
  });

  describe('POST /shipments/:clientId', () => {
    it('should return 400 for unsupported client', async () => {
      const response = await request(app)
        .post('/shipments/unknown-client')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Unsupported client');
    });

    it('should process client-a data successfully', async () => {
      const payload = {
        shipmentReference: 'A1',
        originPortCode: 'OP',
        destinationPortCode: 'DP',
        departureEstimate: '2026-01-01',
        arrivalEstimate: '2026-01-02',
        cargoWeightKg: 100,
        shipmentState: 'BOOKED'
      };

      const response = await request(app)
        .post('/shipments/client-a')
        .send(payload);

      expect(response.status).toBe(201);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(response.body.shipment_id).toBe('A1');
    });

    it('should return 400 for invalid client-a data', async () => {
      const response = await request(app)
        .post('/shipments/client-a')
        .send({ shipmentReference: 'A1' }); // missing fields

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /shipments', () => {
    it('should return all shipments as JSON', async () => {
      const shipments: Shipment[] = [{
        shipment_id: '1',
        origin_port: 'A',
        destination_port: 'B',
        etd: '2026-01-01',
        eta: '2026-01-02',
        weight: 100,
        status: ShipmentStatus.BOOKED
      }];
      mockRepository.findAll.mockResolvedValue(shipments);

      const response = await request(app).get('/shipments');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(shipments);
    });

    it('should return HTML when Accept header is text/html', async () => {
      const response = await request(app)
        .get('/shipments')
        .set('Accept', 'text/html');

      expect(response.status).toBe(200);
      expect(response.text).toContain('<!DOCTYPE html>');
      expect(response.text).toContain('Standardised Shipments');
    });
  });
});
