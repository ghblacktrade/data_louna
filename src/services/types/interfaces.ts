export interface PriceItem {
    market_hash_name: string;
    currency: string;
    suggested_price: number;
    tradablePrice: number | null;
    nonTradablePrice: number | null;
    item_page: string;
    market_page: string;
    min_price: number | null;
    max_price: number | null;
    mean_price: number | null;
    median_price: number | null;
    quantity: number;
    created_at: number;
    updated_at: number;
}
