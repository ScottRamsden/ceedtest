Client A
```
curl -X POST http://localhost:3000/shipments/client-a \
-H "Content-Type: application/json" \
-d '{
"shipmentReference": "CBX-784512",
"originPortCode": "NLRTM",
"destinationPortCode": "USNYC",
"departureEstimate": "2026-02-10T18:00:00Z",
"arrivalEstimate": "2026-02-22T09:30:00Z",
"cargoWeightKg": 12450,
"shipmentState": "IN_TRANSIT"
}'
```
Client B
```
curl -X POST http://localhost:3000/shipments/client-b \
-H "Content-Type: application/json" \
-d '{
"id": "A9981-SH",
"route": {
"pol": "SGSIN",
"pod": "CNSHA"
},
"schedule": {
"etd": "2026-03-01",
"eta": "2026-03-18"
},
"metrics": {
"weight": 9800
},
"status_code": "INTRANSIT"
}'
```