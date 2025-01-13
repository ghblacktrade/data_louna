export type RawPriceItem = {
    market_hash_name: string;
    currency: string;
    suggested_price: number;
    min_price?: number | null;
    max_price?: number | null;
    mean_price?: number | null;
    median_price?: number | null;
    quantity: number;
    item_page: string;
    market_page: string;
    created_at: number;
    updated_at: number;
};

