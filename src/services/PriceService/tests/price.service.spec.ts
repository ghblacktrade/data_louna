import Redis from 'ioredis';
import axios from 'axios';
import zlib from 'zlib';
import {
    RawPriceItem
} from "../../types/types";
import { PriceService } from "../price.service";
import { ERRORS } from "../../constants/errors";
import { combinePricesUtil } from "../utils/combinePrices.util";
import { AxiosResponse } from 'axios';


jest.mock('ioredis');
jest.mock('axios');
jest.mock('zlib');

const mockedRedis = Redis as jest.MockedClass<typeof Redis>;
const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedZlib = zlib as jest.Mocked<typeof zlib>;

const fakeTradableItems: RawPriceItem[] = [
    {
        market_hash_name: 'Item 1',
        currency: 'EUR',
        suggested_price: 100,
        min_price: 90,
        max_price: 110,
        mean_price: 100,
        median_price: 100,
        quantity: 5,
        created_at: 1620000000,
        updated_at: 1620001000,
        item_page: 'http://example.com/item1',
        market_page: 'http://example.com/market1',
    },
];

const fakeNonTradableItems: RawPriceItem[] = [
    {
        market_hash_name: 'Item 1',
        currency: 'EUR',
        suggested_price: 100,
        min_price: 85,
        max_price: 115,
        mean_price: 98,
        median_price: 99,
        quantity: 3,
        created_at: 1620000000,
        updated_at: 1620002000,
        item_page: 'http://example.com/item1',
        market_page: 'http://example.com/market1',
    },
];

const mockedResponse: AxiosResponse = {
    data: Buffer.from('fakeCompressedData'),
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
};

describe('PriceService', () => {
    let priceService: PriceService;

    beforeEach(() => {
        mockedRedis.prototype.get.mockReset();
        mockedRedis.prototype.set.mockReset();
        mockedAxios.get.mockReset();
        mockedZlib.brotliDecompressSync.mockReset();

        priceService = new PriceService();
    });

    it('should return cached prices', async () => {
        mockedRedis.prototype.get.mockResolvedValue(JSON.stringify(fakeTradableItems));

        const result = await priceService.getPrices();

        expect(mockedRedis.prototype.get).toHaveBeenCalledWith('items_prices');
        expect(result.payload).toEqual(fakeTradableItems);
    });

    it('should fetch prices from api if no cace', async () => {
        mockedRedis.prototype.get.mockResolvedValue(null);
        mockedAxios.get.mockResolvedValueOnce(mockedResponse);
        mockedAxios.get.mockResolvedValueOnce(mockedResponse);
        mockedZlib.brotliDecompressSync.mockReturnValueOnce(
            Buffer.from(JSON.stringify(fakeTradableItems))
        );
        mockedZlib.brotliDecompressSync.mockReturnValueOnce(
            Buffer.from(JSON.stringify(fakeNonTradableItems))
        );

        const combinePricesUtilSpy = jest.spyOn(require('../utils/combinePrices.util'), 'combinePricesUtil');
        combinePricesUtilSpy.mockResolvedValue({ payload: fakeTradableItems });

        const result = await priceService.getPrices();

        expect(mockedRedis.prototype.get).toHaveBeenCalledWith('items_prices');
        expect(mockedAxios.get).toHaveBeenCalledTimes(2);
        expect(mockedRedis.prototype.set).toHaveBeenCalledWith(
            'items_prices',
            JSON.stringify(fakeTradableItems),
            'EX',
            300
        );
        expect(result.payload).toEqual(fakeTradableItems);

        combinePricesUtilSpy.mockRestore();
    });

    it('should return error if api request fail', async () => {
        mockedRedis.prototype.get.mockResolvedValue(null);
        mockedAxios.get.mockRejectedValue(new Error('API Error'));

        const result = await priceService.getPrices();

        expect(mockedAxios.get).toHaveBeenCalled();
        expect(result.error).toBe(ERRORS.FAILED_TO_FETCH_PRICES);
    });
});

describe('combinePricesUtil', () => {
    it('should combine tradable and non-tradable prices correctly', async () => {
        const result = await combinePricesUtil(fakeTradableItems, fakeNonTradableItems);

        expect(result.payload).toEqual([
            {
                market_hash_name: 'Item 1',
                currency: 'EUR',
                suggested_price: 100,
                tradablePrice: 90,
                nonTradablePrice: 85,
                item_page: 'http://example.com/item1',
                market_page: 'http://example.com/market1',
                min_price: 90,
                max_price: 110,
                mean_price: 100,
                median_price: 100,
                quantity: 5,
                created_at: 1620000000,
                updated_at: 1620001000,
            },
        ]);
    });

    it('should return an error if an exception occurs', async () => {
        const result = await combinePricesUtil(fakeTradableItems, null as any);

        expect(result.error).toBe(ERRORS.FAILED_TO_COMBINE_PRICES);
    });
});
