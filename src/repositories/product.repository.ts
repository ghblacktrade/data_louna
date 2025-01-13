import { CommonRepositoryResponse } from "../common/types/commonRepositoryResponse.type";
import { ERRORS } from "./constants/errors";
import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' })

const db = postgres({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
});

export class ProductRepository {
    async findProductById(productId: number): CommonRepositoryResponse<{ id: number; name: string; price: number }> {
        try {
            const [product] = await db<{ id: number; name: string; price: number }[]>`
            SELECT id, name, price FROM products WHERE id = ${productId}
          `;

            return { payload: product || null };
        } catch (error) {
            return { error: ERRORS.PRODUCT_NOT_FOUND };
        }
    }
}
