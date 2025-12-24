import { Request, Response } from 'express';
import rateService from '../services/rateService.js';
import logger from '../utils/logger.js';

class RateController {
  public async getRate(req: Request, res: Response): Promise<void> {
    try {
      const rate = await rateService.getRate();
      res.json({ rate });
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Error in getRate controller:', error.message);
        res.status(500).json({ error: 'Failed to get exchange rate.' });
      } else {
        logger.error('An unknown error occurred in getRate controller');
        res.status(500).json({ error: 'An unknown error occurred.' });
      }
    }
  }
}

export default new RateController();
