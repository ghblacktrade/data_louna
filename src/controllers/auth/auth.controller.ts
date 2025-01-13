import { AuthService } from "../../services/AuthService/auth.service";
import { Request, Response } from 'express';
import { MESSAGES } from "../constants/messages";
import { z } from 'zod';

const registerSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
});

const loginSchema = registerSchema;
const changePasswordSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    oldPassword: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
    newPassword: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
});

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    async register(req: Request, res: Response) {
        try {
            registerSchema.parse(req.body);
        } catch (error) {
            return res.status(400).json({ error: error.errors });
        }

        const { email, password } = req.body;
        const result = await this.authService.register(email, password);

        if (result.error) {
            return res.status(400).json({ error: result.error });
        }

        res.status(201).json({ message: MESSAGES.USER_REGISTERED, user: result.payload });
    }

    async login(req: Request, res: Response) {
        try {
            loginSchema.parse(req.body);
        } catch (error) {
            return res.status(400).json({ error: error.errors });
        }

        const { email, password } = req.body;
        const result = await this.authService.login(email, password);

        if (result.error) {
            return res.status(401).json({ error: result.error });
        }

        res.json({ message: MESSAGES.LOGIN_SUCCESS, user: result.payload });
    }

    async changePassword(req: Request, res: Response) {
        try {
            changePasswordSchema.parse(req.body);
        } catch (error) {
            return res.status(400).json({ error: error.errors });
        }

        const { email, oldPassword, newPassword } = req.body;
        const result = await this.authService.changePassword(email, oldPassword, newPassword);

        if (result.error) {
            return res.status(400).json({ error: result.error });
        }

        res.json({ message: MESSAGES.PASSWORD_CHANGED });
    }
}

