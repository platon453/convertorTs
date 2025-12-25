import express from 'express';
import dotenv from 'dotenv';
import rateController from './controllers/rateController.js';
import historyController from './controllers/historyController.js';
import logger from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.get('/api/rate/:from-:to', rateController.getRate);
app.get('/api/history/:from-:to', historyController.getHistory);

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
