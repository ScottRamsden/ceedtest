import React from 'react';
import { Shipment } from '../domain/shipment';
import { Ship, Anchor, Weight, Activity, Calendar } from 'lucide-react';

interface ShipmentTableProps {
  shipments: Shipment[];
}

export const ShipmentTable: React.FC<ShipmentTableProps> = ({ shipments }) => {
  return (
    <div className="container">
      <header>
        <h1>
          <Ship size={32} /> Standardised Shipments
        </h1>
      </header>
      <main>
        {shipments.length === 0 ? (
          <p className="no-data">No shipments found</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>
                    <Anchor size={16} /> Origin
                  </th>
                  <th>
                    <Anchor size={16} /> Destination
                  </th>
                  <th>
                    <Calendar size={16} /> ETD
                  </th>
                  <th>
                    <Calendar size={16} /> ETA
                  </th>
                  <th>
                    <Weight size={16} /> Weight (kg)
                  </th>
                  <th>
                    <Activity size={16} /> Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((s) => (
                  <tr key={s.shipment_id}>
                    <td>
                      <code>{s.shipment_id}</code>
                    </td>
                    <td>{s.origin_port}</td>
                    <td>{s.destination_port}</td>
                    <td>{s.etd}</td>
                    <td>{s.eta}</td>
                    <td>{s.weight.toLocaleString()}</td>
                    <td>
                      <span className={`status-badge status-${s.status.toLowerCase()}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        body { 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
          margin: 0; 
          padding: 20px; 
          background-color: #f8f9fa;
          color: #333;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        header {
          display: flex;
          align-items: center;
          margin-bottom: 30px;
        }
        header h1 {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0;
          color: #1a202c;
        }
        .table-wrapper {
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          text-align: left;
        }
        th, td { 
          padding: 12px 16px; 
          border-bottom: 1px solid #edf2f7; 
        }
        th { 
          background-color: #f7fafc; 
          color: #4a5568;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }
        th svg {
          vertical-align: middle;
          margin-right: 4px;
        }
        tr:hover { background-color: #fcfcfc; }
        code {
          background: #f1f5f9;
          padding: 2px 4px;
          border-radius: 4px;
          font-family: monospace;
          color: #475569;
        }
        .status-badge {
          padding: 4px 8px;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .status-booked { background: #ebf8ff; color: #2b6cb0; }
        .status-in_transit { background: #feebc8; color: #9c4221; }
        .status-departed { background: #faf5ff; color: #6b46c1; }
        .status-arrived { background: #f0fff4; color: #2f855a; }
        .no-data {
          text-align: center;
          padding: 40px;
          background: white;
          border-radius: 8px;
          color: #718096;
        }
      `,
        }}
      />
    </div>
  );
};
