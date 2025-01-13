import { Router } from 'express';
import { PurchaseController } from '../controllers/purchase/purchase.controller';

const router = Router();
const purchaseController = new PurchaseController();

router.post('/purchase', purchaseController.purchase.bind(purchaseController));

export default router;
