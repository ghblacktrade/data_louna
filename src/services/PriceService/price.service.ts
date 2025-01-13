import axios from 'axios';
import Redis from 'ioredis';
import { CommonServiceResponse } from '../../common/types/commonServiceResponse.type';
import { ERRORS } from '../constants/errors';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' })
import * as zlib from 'zlib';
import { PriceItem } from "../types/interfaces";
import { RawPriceItem } from "../types/types";
import {
    combinePricesUtil
} from "./utils/combinePrices.util";

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

    public async getPrices(): CommonServiceResponse<PriceItem[]> {
        try {
            const cachedPrices = await this.redis.get(this.cacheKey);
            if (cachedPrices) {
                return { payload: JSON.parse(cachedPrices) as PriceItem[] };
            }

            const clientId = 'cba9d3e5ad2c4b76ba1b9081eabdfbfa';
            const clientSecret = 'nH5RaSEZbbBkomvW6OeXwQrLjd4MBLlfWKZhPKMkRIRXlBC8cme1tvTbByHu2Ce9DWoeDrfh8fEyP3p0uinRbA==';
            const encodedData = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

            const [tradableItems, nonTradableItems] = await Promise.all([
                this.fetchPrices(encodedData, true),
                this.fetchPrices(encodedData, false),
            ]);

            const {error, payload: combinePricesUtilResult} = await combinePricesUtil(tradableItems, nonTradableItems);

            if (error) {
                return {error};
            }

            const items = combinePricesUtilResult;

            await this.redis.set(this.cacheKey, JSON.stringify(items), 'EX', 300);

            return { payload: items };
        } catch (error) {
            return { error: ERRORS.FAILED_TO_FETCH_PRICES };
        }
    }

    private async fetchPrices(authHeader: string, tradable: boolean): Promise<RawPriceItem[]> {
        const response = await axios.get<ArrayBuffer>(this.apiUrl, {
            params: {
                app_id: '730',
                currency: 'EUR',
                tradable,
            },
            headers: {
                Accept: 'application/json',
                'Accept-Encoding': 'br',
                Authorization: `Basic ${authHeader}`,
            },
            responseType: 'arraybuffer',
        });

        const decompressedData = zlib.brotliDecompressSync(response.data);
        const rawItems: RawPriceItem[] = JSON.parse(decompressedData.toString('utf-8'));

        if (!Array.isArray(rawItems)) {
            throw new Error(ERRORS.INVALID_API_RESPONSE);
        }

        return rawItems;
    }
}

