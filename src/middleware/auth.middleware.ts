import basicAuth from 'express-basic-auth';
import { ShipmentRepository } from '../persistence';
import logger from '../utils/logger';

export const createAuthMiddleware = (shipmentRepository: ShipmentRepository) => {
  return basicAuth({
    authorizer: (username, password, cb) => {
      if (shipmentRepository.verifyUser) {
        shipmentRepository
          .verifyUser(username, password)
          .then((isValid) => cb(null, isValid))
          .catch((err) => {
            logger.error('Auth check failed', { error: err });
            cb(null, false);
          });
      } else {
        cb(null, true);
      }
    },
    authorizeAsync: true,
    challenge: true,
    realm: 'ShipmentAPI',
  });
};
