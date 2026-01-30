import Redis from 'ioredis';
import { Shipment } from '../domain/shipment';
import { ShipmentRepository } from './shipment-repository.interface';

export class RedisShipmentRepository implements ShipmentRepository {
  private redis: Redis;
  private readonly KEY = 'shipments';

  constructor(redisUrl: string = process.env.REDIS_URL || 'redis://localhost:6379') {
    this.redis = new Redis(redisUrl);
  }

  async save(shipment: Shipment): Promise<void> {
    await this.redis.rpush(this.KEY, JSON.stringify(shipment));
  }

  async findAll(): Promise<Shipment[]> {
    const data = await this.redis.lrange(this.KEY, 0, -1);
    return data.map((item) => JSON.parse(item));
  }
}
