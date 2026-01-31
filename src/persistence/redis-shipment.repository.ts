import Redis from 'ioredis';
import { Shipment } from '../domain/shipment';
import { ShipmentRepository } from './shipment-repository.interface';
import logger from '../utils/logger';

export class RedisShipmentRepository implements ShipmentRepository {
  private redis: Redis;
  private readonly KEY = 'shipments';

  constructor(redisUrl: string = process.env.REDIS_URL || 'redis://localhost:6379') {
    this.redis = new Redis(redisUrl);
    this.redis.on('error', (err) => {
      logger.error('Redis connection error', { error: err });
    });
    this.redis.on('connect', () => {
      logger.info('Connected to Redis');
    });
  }

  async save(shipment: Shipment): Promise<void> {
    try {
      await this.redis.rpush(this.KEY, JSON.stringify(shipment));
    } catch (error) {
      logger.error('Failed to save shipment to Redis', { error, shipmentId: shipment.shipment_id });
      throw error;
    }
  }

  async saveAll(shipments: Shipment[]): Promise<void> {
    try {
      if (shipments.length === 0) return;
      const pipeline = this.redis.pipeline();
      const stringifiedShipments = shipments.map((s) => JSON.stringify(s));
      await this.redis.rpush(this.KEY, ...stringifiedShipments);
      logger.info(`Bulk saved ${shipments.length} shipments to Redis`);
    } catch (error) {
      logger.error('Failed to bulk save shipments to Redis', { error });
      throw error;
    }
  }

  async findAll(): Promise<Shipment[]> {
    try {
      const data = await this.redis.lrange(this.KEY, 0, -1);
      return data.map((item) => JSON.parse(item));
    } catch (error) {
      logger.error('Failed to fetch shipments from Redis', { error });
      return [];
    }
  }
}
