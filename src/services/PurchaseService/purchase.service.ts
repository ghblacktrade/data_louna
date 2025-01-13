import { UserRepository } from "../../repositories/user.repository";
import { ProductRepository } from "../../repositories/product.repository";
import { PurchaseRepository } from "../../repositories/purchase.repository";
import { CommonServiceResponse } from "../../common/types/commonServiceResponse.type";
import { ERRORS } from "../constants/errors";


export class PurchaseService {
    private userRepository = new UserRepository();
    private productRepository = new ProductRepository();
    private purchaseRepository = new PurchaseRepository();

    constructor(
        userRepository: UserRepository,
        productRepository: ProductRepository,
        purchaseRepository: PurchaseRepository
    ) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.purchaseRepository = purchaseRepository;
    }

    public async purchaseProduct(userId: number, productId: number, quantity: number): CommonServiceResponse<{ balance: number }> {
        const { error: userError, payload: userBalance } = await this.userRepository.findUserBalance(userId);
        if (userError || !userBalance) {
            return { error: ERRORS.USER_NOT_FOUND };
        }

        const { error: productError, payload: product } = await this.productRepository.findProductById(productId);
        if (productError || !product) {
            return { error: ERRORS.PRODUCT_NOT_FOUND };
        }

        const totalPrice = product.price * quantity;

        if (userBalance.balance < totalPrice) {
            return { error: ERRORS.INSUFFICIENT_BALANCE };
        }

        const { error: updateError } = await this.userRepository.updateUserBalance(userId, totalPrice);
        if (updateError) {
            return { error: ERRORS.INSUFFICIENT_BALANCE };
        }

        const updatedBalance = userBalance.balance - totalPrice;

        await this.purchaseRepository.createPurchase(userId, productId, quantity, totalPrice);

        return { payload: { balance: updatedBalance } };
    }
}
