import { Router } from 'express';
import { AuthController } from "../controllers/auth/auth.controller";

const router = Router();
const authController = new AuthController();

router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/change_password', authController.changePassword.bind(authController));

export default router;
