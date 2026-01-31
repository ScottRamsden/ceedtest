import mysql, { Pool } from 'mysql2/promise';
import { Shipment } from '../domain/shipment';
import { ShipmentRepository } from './shipment-repository.interface';
import logger from '../utils/logger';

export class MysqlShipmentRepository implements ShipmentRepository {
  private pool: Pool;

  constructor(config: any) {
    this.pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    this.init();
  }

  private async init() {
    const maxRetries = 10;
    const retryDelay = 5000;

    for (let i = 0; i < maxRetries; i++) {
      try {
        logger.info(`Attempting to initialize MySQL (Attempt ${i + 1}/${maxRetries})...`);
        await this.pool.execute('SELECT 1');

        await this.pool.execute(`
          CREATE TABLE IF NOT EXISTS shipments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            shipment_id VARCHAR(255) NOT NULL,
            origin_port VARCHAR(255) NOT NULL,
            destination_port VARCHAR(255) NOT NULL,
            etd VARCHAR(255) NOT NULL,
            eta VARCHAR(255) NOT NULL,
            weight DOUBLE NOT NULL,
            status VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        await this.pool.execute(`
          CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        await this.pool.execute('INSERT IGNORE INTO users (username, password) VALUES (?, ?)', [
          'admin',
          'password',
        ]);

        logger.info('MySQL initialized');
        return;
      } catch (error) {
        logger.warn(
          `MySQL initialization attempt ${i + 1} failed. Retrying in ${retryDelay / 1000}s...`,
        );
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }

    logger.error('Failed to initialize MySQL after maximum retries');
  }

  async save(shipment: Shipment): Promise<void> {
    try {
      await this.pool.execute(
        'INSERT INTO shipments (shipment_id, origin_port, destination_port, etd, eta, weight, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          shipment.shipment_id,
          shipment.origin_port,
          shipment.destination_port,
          shipment.etd,
          shipment.eta,
          shipment.weight,
          shipment.status,
        ],
      );
    } catch (error) {
      logger.error('Failed to save shipment to MySQL', { error, shipmentId: shipment.shipment_id });
      throw error;
    }
  }

  async findAll(): Promise<Shipment[]> {
    try {
      const [rows] = await this.pool.execute('SELECT * FROM shipments');
      return (rows as any[]).map((row) => ({
        shipment_id: row.shipment_id,
        origin_port: row.origin_port,
        destination_port: row.destination_port,
        etd: row.etd,
        eta: row.eta,
        weight: row.weight,
        status: row.status,
      }));
    } catch (error) {
      logger.error('Failed to fetch shipments from MySQL', { error });
      throw error;
    }
  }

  async verifyUser(username: string, password: string): Promise<boolean> {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        [username, password],
      );
      return (rows as any[]).length > 0;
    } catch (error) {
      logger.error('Failed to verify user in MySQL', { error, username });
      return false;
    }
  }
}
