import request from 'supertest';
const config = require('../config');
import { createShipmentApp } from './app';
import { ShipmentRepository } from './persistence';
import { Shipment, ShipmentStatus } from './domain/shipment';

describe('API Integration Tests', () => {
  let mockRepository: any;
  let app: any;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findAll: jest.fn().mockResolvedValue([]),
      verifyUser: jest.fn().mockResolvedValue(true),
    };
    app = createShipmentApp(mockRepository);
  });

  describe('POST /shipments/:clientId', () => {
    it('should return 400 for unsupported client', async () => {
      const response = await request(app).post('/shipments/unknown-client').send({});

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
        shipmentState: 'BOOKED',
      };

      const response = await request(app).post('/shipments/client-a').send(payload);

      expect(response.status).toBe(201);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(response.body.shipment_id).toBe('A1');
    });

    it('should return 400 for invalid client-a data', async () => {
      const response = await request(app)
        .post('/shipments/client-a')
        .send({ shipmentReference: 'A1' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /shipments', () => {
    it('should return 401 when no credentials are provided', async () => {
      mockRepository.verifyUser.mockResolvedValue(false);
      const response = await request(app).get('/shipments');
      expect(response.status).toBe(401);
    });

    it('should return 401 when invalid credentials are provided', async () => {
      mockRepository.verifyUser.mockResolvedValue(false);
      const response = await request(app)
        .get('/shipments')
        .set('Authorization', 'Basic d3Jvbmc6cGFzc3dvcmQ=');
      expect(response.status).toBe(401);
    });

    it('should return all shipments as JSON when authorized', async () => {
      const shipments: Shipment[] = [
        {
          shipment_id: '1',
          origin_port: 'A',
          destination_port: 'B',
          etd: '2026-01-01',
          eta: '2026-01-02',
          weight: 100,
          status: ShipmentStatus.BOOKED,
        },
      ];
      mockRepository.findAll.mockResolvedValue(shipments);
      mockRepository.verifyUser.mockResolvedValue(true);

      const response = await request(app)
        .get('/shipments')
        .set('Authorization', 'Basic YWRtaW46cGFzc3dvcmQ=');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(shipments);
    });

    it('should return HTML when Accept header is text/html and authorized', async () => {
      mockRepository.verifyUser.mockResolvedValue(true);
      const response = await request(app)
        .get('/shipments')
        .set('Accept', 'text/html')
        .set('Authorization', 'Basic YWRtaW46cGFzc3dvcmQ=');

      expect(response.status).toBe(200);
      expect(response.text).toContain('<!DOCTYPE html>');
      expect(response.text).toContain('Standardised Shipments');
    });
  });

  describe('Rate Limiting', () => {
    it('should return 429 when rate limit is exceeded', async () => {
      config.rateLimit.max = 2;
      config.rateLimit.windowMs = 60000;

      const limitedApp = createShipmentApp(mockRepository);

      await request(limitedApp)
        .get('/shipments')
        .set('Authorization', 'Basic YWRtaW46cGFzc3dvcmQ=')
        .expect(200);
      await request(limitedApp)
        .get('/shipments')
        .set('Authorization', 'Basic YWRtaW46cGFzc3dvcmQ=')
        .expect(200);

      const response = await request(limitedApp)
        .get('/shipments')
        .set('Authorization', 'Basic YWRtaW46cGFzc3dvcmQ=');
      expect(response.status).toBe(429);
      expect(response.body.error).toBe('Too many requests, please try again later.');
    });
  });
});
