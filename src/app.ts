import express, { Request, Response } from 'express';
import { z } from 'zod';
import { ClientAdapter, ClientAAdapter, ClientBAdapter } from './adapters';
import { RedisShipmentRepository, ShipmentRepository } from './persistence';

const app = express();
app.use(express.json());

export const createShipmentApp = (shipmentRepository: ShipmentRepository) => {
  const router = express.Router();
  // Registered adapters
  const adapters: ClientAdapter<any>[] = [
    new ClientAAdapter(),
    new ClientBAdapter()
  ];

  // Routes
  router.post('/shipments/:clientId', async (req: Request, res: Response) => {
    const { clientId } = req.params;
    const adapter = adapters.find(a => a.supports(clientId));

    if (!adapter) {
      return res.status(400).json({ error: `Unsupported client: ${clientId}` });
    }

    try {
      const validatedBody = adapter.validate(req.body);
      const standardised = adapter.standardise(validatedBody);
      await shipmentRepository.save(standardised);
      res.status(201).json(standardised);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      res.status(422).json({ error: 'Failed to standardise shipment data' });
    }
  });

  router.get('/shipments', async (req: Request, res: Response) => {
    const shipments = await shipmentRepository.findAll();
    
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      const rows = shipments.map(s => `
        <tr>
          <td>${s.shipment_id}</td>
          <td>${s.origin_port}</td>
          <td>${s.destination_port}</td>
          <td>${s.etd}</td>
          <td>${s.eta}</td>
          <td>${s.weight}</td>
          <td>${s.status}</td>
        </tr>
      `).join('');

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Shipments</title>
          <style>
            body { font-family: sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 10px; border: 1px solid #ccc; text-align: left; }
            th { background-color: #f4f4f4; }
            tr:nth-child(even) { background-color: #fafafa; }
          </style>
        </head>
        <body>
          <h1>Standardised Shipments</h1>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Origin Port</th>
                <th>Destination Port</th>
                <th>ETD</th>
                <th>ETA</th>
                <th>Weight (kg)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="7">No shipments found</td></tr>'}
            </tbody>
          </table>
        </body>
        </html>
      `;
      return res.send(html);
    }
    res.json(shipments);
  });

  const localApp = express();
  localApp.use(express.json());
  localApp.use(router);
  return localApp;
};

export default app;
