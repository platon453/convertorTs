import axios from 'axios';
import NodeCache from 'node-cache';
import logger from '../utils/logger.js';

const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

class RateService {
  private async fetchRateFromAPI(): Promise<number> {
    try {
      const response = await axios.get('https://api.exchangerate-api.com/v4/latest/EUR');
      const rate = response.data.rates.RUB;
      if (!rate) {
        throw new Error('RUB rate not found in API response');
      }
      return rate;
    } catch (error) {
      logger.error('Error fetching rate from API:', error);
      throw new Error('Failed to fetch exchange rate from external API.');
    }
  }

  public async getRate(): Promise<number> {
    const cachedRate = cache.get<number>('EUR_RUB');
    if (cachedRate) {
      logger.info('Returning cached rate');
      return cachedRate;
    }

    logger.info('Fetching new rate from API');
    const rate = await this.fetchRateFromAPI();
    cache.set('EUR_RUB', rate);
    return rate;
  }
}

export default new RateService();


