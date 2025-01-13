import axios from 'axios';
import Redis from 'ioredis';
import { CommonServiceResponse } from '../../common/types/commonServiceResponse.type';
import { ERRORS } from '../constants/errors';

interface PriceItem {
    name: string;
    tradablePrice: number | null;
    nonTradablePrice: number | null;
}

export class PriceService {
    private apiUrl = 'https://api.skinport.com/v1/items';
    private cacheKey = 'items_prices';
    private redis: Redis;

    constructor() {
        this.redis = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
        });
    }

    async getPrices(): CommonServiceResponse<PriceItem[]> {
        try {
            const cachedPrices = await this.redis.get(this.cacheKey);
            if (cachedPrices) {
                console.log('Returning cached data');
                return { payload: JSON.parse(cachedPrices) };
            }

            const response = await axios.get(this.apiUrl, {
                params: {
                    app_id: '730',
                    currency: 'usd',
                },
            });

            if (!response.data || !Array.isArray(response.data)) {
                return { error: ERRORS.INVALID_API_RESPONSE };
            }

            const items: PriceItem[] = response.data.map((item: any) => {
                const tradablePrice = Math.min(
                    ...item.tradable.map((entry: any) => entry.price)
                );
                const nonTradablePrice = Math.min(
                    ...item.non_tradable.map((entry: any) => entry.price)
                );

                return {
                    name: item.name,
                    tradablePrice: tradablePrice || null,
                    nonTradablePrice: nonTradablePrice || null,
                };
            });

            await this.redis.set(this.cacheKey, JSON.stringify(items), 'EX', 300);

            return { payload: items };
        } catch (error) {
            console.error('Error in getPrices:', error);
            return { error: ERRORS.FAILED_TO_FETCH_PRICES };
        }
    }
}
