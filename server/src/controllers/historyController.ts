import { Request, Response } from 'express';
import historyService from '../services/historyService.js';
import logger from '../utils/logger.js';

class HistoryController {
  public async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const { from, to } = req.params;
      if (!from || !to) {
        res.status(400).json({ error: 'Currency pair is required.' });
        return;
      }
      const history = await historyService.getHistory(from.toUpperCase(), to.toUpperCase());
      res.json(history);
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Error in getHistory controller:', error.message);
        res.status(500).json({ error: 'Failed to get currency history.' });
      } else {
        logger.error('An unknown error occurred in getHistory controller');
        res.status(500).json({ error: 'An unknown error occurred.' });
      }
    }
  }
}

export default new HistoryController();
