import { z } from 'zod';
import { logger } from '../../core/logger.js';

const BinanceTickerSchema = z.object({
  symbol: z.string(),
  price: z.string().transform((val) => parseFloat(val).toFixed(2)),
});

export const PriceService = {
  fetchSolanaPrice: async (): Promise<string | null> => {
    try {
      const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT');
      
      if (!response.ok) throw new Error(`API Status: ${response.status}`);

      const json = await response.json();
      const data = BinanceTickerSchema.parse(json);
      
      return data.price;
    } catch (error) {
      logger.error({ error }, 'Failed to fetch price');
      return null;
    }
  }
};
