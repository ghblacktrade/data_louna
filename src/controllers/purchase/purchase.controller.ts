const purchaseService = new PurchaseService();

export class PurchaseController {
    public async purchase(req: Request, res: Response) {
        const { userId, productId, quantity } = req.body;

        if (!userId || !productId || !quantity || quantity <= 0) {
            return res.status(400).json({ error: ERRORS.INVALID_REQUEST });
        }

        const result = await purchaseService.purchaseProduct(userId, productId, quantity);

        if (result.error) {
            return res.status(400).json({ error: result.error });
        }

        res.json({
            message: MESSAGES.PURCHASE_SUCCESS,
            total_price: result.payload?.total_price,
        });
    }
}
