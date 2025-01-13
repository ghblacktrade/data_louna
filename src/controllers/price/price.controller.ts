import { Request, Response } from 'express';
import { PriceService } from '../../services/PriceService/price.service';

export class PriceController {
    private priceService: PriceService;

    constructor() {
        this.priceService = new PriceService();
    }

    async getPrices(req: Request, res: Response) {
        const { error, payload } = await this.priceService.getPrices();

        if (error) {
            return res.status(500).json({ error });
        }

        res.json(payload);
    }
}
