import axios from 'axios';
import NodeCache from 'node-cache';
import logger from '../utils/logger.js';

const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

// Define major currencies that the free API supports as a base
const MAJOR_CURRENCIES = ['USD', 'EUR', 'GBP'];

class RateService {
  private async fetchRateFromAPI(from: string, to: string): Promise<number> {
    try {
      const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from}`);
      const rate = response.data.rates[to];
      if (!rate) {
        throw new Error(`${to} rate not found in API response for base ${from}`);
      }
      return rate;
    } catch (error) {
      logger.error('Error fetching rate from API:', error);
      throw new Error('Failed to fetch exchange rate from external API.');
    }
  }

  public async getRate(from: string, to: string): Promise<number> {
    if (from === to) {
      return 1;
    }

    // For reverse conversions (e.g., RUB -> EUR), we fetch EUR -> RUB and invert it.
    let isReversed = false;
    if (!MAJOR_CURRENCIES.includes(from) && MAJOR_CURRENCIES.includes(to)) {
        [from, to] = [to, from]; // Swap currencies
        isReversed = true;
    }

    const cacheKey = `${from}_${to}`;
    const cachedRate = cache.get<number>(cacheKey);
    if (cachedRate) {
      logger.info(`Returning cached rate for ${cacheKey}`);
      return isReversed ? 1 / cachedRate : cachedRate;
    }

    logger.info(`Fetching new rate from API for ${cacheKey}`);
    const rate = await this.fetchRateFromAPI(from, to);
    cache.set(cacheKey, rate);
    
    return isReversed ? 1 / rate : rate;
  }
}

export default new RateService();


