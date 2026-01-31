import { createShipmentApp } from './app';
import {
  RedisShipmentRepository,
  MysqlShipmentRepository,
  DualShipmentRepository,
} from './persistence';
import logger from './utils/logger';
const config = require('../config');

const PORT = process.env.PORT || 3000;

const redisRepository = new RedisShipmentRepository(config.redis.url);
const mysqlRepository = new MysqlShipmentRepository(config.mysql);
const repository = new DualShipmentRepository(redisRepository, mysqlRepository);

const app = createShipmentApp(repository);

repository.syncFromSecondary().then(() => {
  logger.info('Initial synchronization complete');
});

app.listen(PORT, () => {
  logger.info(`Shipment API running on port ${PORT}`);
});
