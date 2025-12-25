import logger from '../utils/logger.js';
import rateService from './rateService.js';

interface HistoryData {
    [date: string]: {
        [currency: string]: number;
    };
}

class HistoryService {
  public async getHistory(from: string, to: string): Promise<HistoryData> {
    logger.info(`Generating simulated history for ${from}-${to}`);
    
    if (from === to) {
        return {};
    }

    try {
      // 1. Get the current, real rate to use as a baseline
      const currentRate = await rateService.getRate(from, to);
      const history: HistoryData = {};

      // 2. Generate data for the last 7 days
      for (let i = 7; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];

        // 3. Add some random variation for a realistic look
        const variation = (Math.random() - 0.5) * (currentRate * 0.05); // Fluctuation up to 5%
        const simulatedRate = currentRate + variation;

        history[dateString] = { [to]: simulatedRate };
      }
      
      return history;

    } catch (error) {
      logger.error('Error getting current rate for history simulation:', error);
      throw new Error('Failed to generate currency history.');
    }
  }
}

export default new HistoryService();
