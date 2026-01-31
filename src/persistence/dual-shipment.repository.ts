import { Shipment } from '../domain/shipment';
import { ShipmentRepository } from './shipment-repository.interface';
import logger from '../utils/logger';

export class DualShipmentRepository implements ShipmentRepository {
  constructor(
    private primary: ShipmentRepository,
    private secondary: ShipmentRepository,
  ) {}

  async save(shipment: Shipment): Promise<void> {
    await this.primary.save(shipment);

    this.secondary.save(shipment).catch((error) => {
      logger.error('Secondary storage save failed', { error, shipmentId: shipment.shipment_id });
    });
  }

  async findAll(): Promise<Shipment[]> {
    return this.primary.findAll();
  }

  async syncFromSecondary(): Promise<void> {
    const maxRetries = 10;
    const retryDelay = 5000;

    for (let i = 0; i < maxRetries; i++) {
      try {
        logger.info(
          `Starting synchronization from MySQL to Redis (Attempt ${i + 1}/${maxRetries})...`,
        );
        const shipments = await this.secondary.findAll();

        if (shipments.length > 0) {
          if (this.primary.saveAll) {
            await (this.primary as any).redis.del('shipments');
            await this.primary.saveAll(shipments);
            logger.info(`Synchronized ${shipments.length} shipments from MySQL to Redis`);
          }
        } else {
          logger.info('No shipments found in MySQL to synchronize');
        }
        return;
      } catch (error) {
        logger.warn(
          `Synchronization attempt ${i + 1} failed. Retrying in ${retryDelay / 1000}s...`,
        );
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
    logger.error('Failed to synchronize shipments from MySQL to Redis after maximum retries');
  }

  async verifyUser(username: string, password: string): Promise<boolean> {
    if (this.secondary.verifyUser) {
      return this.secondary.verifyUser(username, password);
    }
    return false;
  }
}
