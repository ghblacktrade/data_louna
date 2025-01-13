import postgres from 'postgres';
import { ERRORS } from "../repositories/constants/errors";
import { CommonRepositoryResponse } from "../common/types/commonRepositoryResponse.type";
import { IUser } from "@src/repositories/types/interfaces";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' })

const db = postgres({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
});

export class UserRepository {
    async createUser(email: string, passwordHash: string): CommonRepositoryResponse<{ id: number; email: string }> {
        try {
            const [user] = await db<IUser[]>`
        insert into users (email, password_hash)
        values (${email}, ${passwordHash})
        returning id, email
      `;

            return { payload: user };
        } catch (error) {
            return { error: ERRORS.FAILED_TO_CREATE };
        }
    }

    async findUserByEmail(email: string): CommonRepositoryResponse<{ id: number; email: string; password_hash: string }> {
        try {
            const [user] = await db<IUser[]>`
        select * from users where email = ${email}
      `;

            return { payload: user || null };
        } catch (error) {
            return { error: ERRORS.FAILED_TO_FIND };
        }
    }

    async updateUserPassword(email: string, newPasswordHash: string): CommonRepositoryResponse<null> {
        try {
            await db`
        update users
        set password_hash = ${newPasswordHash}, updated_at = NOW()
        where email = ${email}
      `;
            return { payload: null };
        } catch (error) {
            return { error: ERRORS.PASSWORD_UPDATE_FAILED };
        }
    }

    async updateUserBalance(userId: number, amount: number): CommonRepositoryResponse<null> {
        try {
            await db`
            UPDATE users
            SET balance = balance - ${amount}, updated_at = NOW()
            WHERE id = ${userId}
          `;
            return { payload: null };
        } catch (error) {
            return { error: ERRORS.INSUFFICIENT_BALANCE };
        }
    }

    async findUserBalance(userId: number): CommonRepositoryResponse<{ balance: number }> {
        try {
            const [user] = await db<{ balance: number }[]>`
            SELECT balance FROM users WHERE id = ${userId}
          `;

            return { payload: user || null };
        } catch (error) {
            return { error: ERRORS.USER_NOT_FOUND };
        }
    }
}
