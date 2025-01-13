import { Router } from 'express';
import { PriceController } from '../controllers/price/price.controller';

const router = Router();
const priceController = new PriceController();

router.get('/prices', priceController.getPrices.bind(priceController));

export default router;
