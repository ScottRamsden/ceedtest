USE shipments;

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
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Preload a default user for testing/demo (password is 'password' in this example)
-- In a real app, passwords should be hashed!
INSERT IGNORE INTO users (username, password) VALUES ('admin', 'password');
