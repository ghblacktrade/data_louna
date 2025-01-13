import {
    RawPriceItem
} from "@src/services/types/types";
import {
    CommonAsyncUtilResponse
} from "@src/common/types/commonUtilResponse.type";
import {
    PriceItem
} from "@src/services/types/interfaces";
import {
    ERRORS
} from "@src/services/constants/errors";

export async function combinePricesUtil(
    tradableItems: RawPriceItem[],
    nonTradableItems: RawPriceItem[]
): CommonAsyncUtilResponse<PriceItem[]> {
    try {
        const itemMap: Map<string, PriceItem> = new Map();

        for (const item of tradableItems) {
            itemMap.set(item.market_hash_name, {
                market_hash_name: item.market_hash_name,
                currency: item.currency,
                suggested_price: item.suggested_price,
                tradablePrice: item.min_price ?? null,
                nonTradablePrice: null,
                item_page: item.item_page,
                market_page: item.market_page,
                min_price: item.min_price ?? null,
                max_price: item.max_price ?? null,
                mean_price: item.mean_price ?? null,
                median_price: item.median_price ?? null,
                quantity: item.quantity,
                created_at: item.created_at,
                updated_at: item.updated_at,
            });
        }

        for (const item of nonTradableItems) {
            const existingItem = itemMap.get(item.market_hash_name);
            if (existingItem) {
                existingItem.nonTradablePrice = item.min_price ?? null;
            } else {
                itemMap.set(item.market_hash_name, {
                    market_hash_name: item.market_hash_name,
                    currency: item.currency,
                    suggested_price: item.suggested_price,
                    tradablePrice: null,
                    nonTradablePrice: item.min_price ?? null,
                    item_page: item.item_page,
                    market_page: item.market_page,
                    min_price: item.min_price ?? null,
                    max_price: item.max_price ?? null,
                    mean_price: item.mean_price ?? null,
                    median_price: item.median_price ?? null,
                    quantity: item.quantity,
                    created_at: item.created_at,
                    updated_at: item.updated_at,
                });
            }
        }

        return { payload: Array.from(itemMap.values()) };
    } catch (error) {
        return { error: ERRORS.FAILED_TO_COMBINE_PRICES };
    }
}
