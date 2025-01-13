import {
    CommonRepositoryResponse
} from "../common/types/commonRepositoryResponse.type";
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

export class PurchaseRepository {
    async createPurchase(
        userId: number,
        productId: number,
        quantity: number,
        totalPrice: number
    ): CommonRepositoryResponse<{ id: number }> {
        try {
            const [purchase] = await db<{ id: number }[]>`
            INSERT INTO purchases (user_id, product_id, quantity, total_price)
            VALUES (${userId}, ${productId}, ${quantity}, ${totalPrice})
            RETURNING id
          `;

            return { payload: purchase };
        } catch (error) {
            return { error: ERRORS.FAILED_TO_CREATE_PURCHASE };
        }
    }
}
