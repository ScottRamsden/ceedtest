import express, { Request, Response } from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';

import { ClientAdapter, ClientAAdapter, ClientBAdapter } from './adapters';
import { ShipmentRepository } from './persistence';
import { createAuthMiddleware } from './middleware/auth.middleware';
import { ShipmentView } from './views/shipment.view';
import logger from './utils/logger';

const app = express();
app.use(express.json());

const config = require('../config');

export const createShipmentApp = (shipmentRepository: ShipmentRepository) => {
  const router = express.Router();
  const adapters: ClientAdapter<any>[] = [new ClientAAdapter(), new ClientBAdapter()];

  router.post('/shipments/:clientId', async (req: Request, res: Response) => {
    const { clientId } = req.params;
    const adapter = adapters.find((a) => a.supports(clientId));

    if (!adapter) {
      logger.warn(`Unsupported client attempted: ${clientId}`);
      return res.status(400).json({ error: `Unsupported client: ${clientId}` });
    }

    try {
      const validatedBody = adapter.validate(req.body);
      const standardised = adapter.standardise(validatedBody);
      await shipmentRepository.save(standardised);
      logger.info(`Successfully processed shipment for client: ${clientId}`, {
        shipmentId: standardised.shipment_id,
      });
      res.status(201).json(standardised);
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn(`Validation failed for client: ${clientId}`, { errors: error.errors });
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      logger.error(`Error processing shipment for client: ${clientId}`, { error });
      res.status(422).json({ error: 'Failed to standardise shipment data' });
    }
  });

  const authMiddleware = createAuthMiddleware(shipmentRepository);

  router.get('/shipments', authMiddleware, async (req: Request, res: Response) => {
    const shipments = await shipmentRepository.findAll();

    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.send(ShipmentView.renderShipmentsTable(shipments));
    }
    res.json(shipments);
  });

  const localApp = express();
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: config.rateLimit.message,
  });

  localApp.use(limiter);
  localApp.use(helmet());
  localApp.use(express.json());
  localApp.use(router);
  return localApp;
};

export default app;
