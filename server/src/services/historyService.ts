import axios from 'axios';
import logger from '../utils/logger.js';

export interface DailyHistory {
    date: string;
    rate: number;
    change: number; // Percentage change from previous day
}

class HistoryService {
  private getISODate(daysAgo: number): string {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  }

  public async getHistory(from: string, to: string): Promise<DailyHistory[]> {
    if (from === to) {
        return [];
    }

    const startDate = this.getISODate(8); // Fetch 8 days to calculate 7 days of change
    const endDate = this.getISODate(0);
    const url = `https://api.exchangerate.host/timeseries?start_date=${startDate}&end_date=${endDate}&base=${from}&symbols=${to}`;
    
    logger.info(`Fetching history from ${url}`);

    try {
      const response = await axios.get(url);
      const rates = response.data.rates;
      
      if (!rates) {
        throw new Error('Historical data not found in API response');
      }

      const sortedDates = Object.keys(rates).sort();
      const history: DailyHistory[] = [];

      for (let i = 1; i < sortedDates.length; i++) {
        const currentDate = sortedDates[i];
        const prevDate = sortedDates[i - 1];

        const currentRate = rates[currentDate][to];
        const prevRate = rates[prevDate][to];

        if (currentRate && prevRate) {
            const change = ((currentRate - prevRate) / prevRate) * 100;
            history.push({
                date: currentDate,
                rate: currentRate,
                change: change
            });
        }
      }
      
      // Return the last 7 days, reversed so the most recent is first
      return history.reverse();

    } catch (error) {
      logger.error('Error fetching history from API:', error);
      throw new Error('Failed to fetch currency history from external API.');
    }
  }
}

export default new HistoryService();
