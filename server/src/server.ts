import express from 'express';
import dotenv from 'dotenv';
import rateController from './controllers/rateController.js';
import logger from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.get('/api/rate', rateController.getRate);

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
