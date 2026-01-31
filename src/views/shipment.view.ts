import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Shipment } from '../domain/shipment';
import { ShipmentTable } from './ShipmentTable';

export class ShipmentView {
  static renderShipmentsTable(shipments: Shipment[]): string {
    const content = renderToStaticMarkup(React.createElement(ShipmentTable, { shipments }));

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Shipments | Standardised Data</title>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;
  }
}
