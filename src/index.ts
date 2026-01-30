import { createShipmentApp } from './app';
import { RedisShipmentRepository } from './persistence';

const PORT = process.env.PORT || 3000;
const repository = new RedisShipmentRepository();
const app = createShipmentApp(repository);

app.listen(PORT, () => {
  console.log(`Shipment Standardisation API running on port ${PORT}`);
});
