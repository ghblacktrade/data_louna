import { PurchaseService } from "@src/services/PurchaseService/purchase.service";
import { UserRepository } from "@src/repositories/user.repository";
import { ProductRepository } from "@src/repositories/product.repository";
import { PurchaseRepository } from "@src/repositories/purchase.repository";
import { ERRORS } from "../../../repositories/constants/errors";

jest.mock('../../../repositories/user.repository');
jest.mock('../../../repositories/product.repository');
jest.mock('../../../repositories/purchase.repository');

describe('PurchaseService', () => {
    let purchaseService: PurchaseService;
    let userRepository: jest.Mocked<UserRepository>;
    let productRepository: jest.Mocked<ProductRepository>;
    let purchaseRepository: jest.Mocked<PurchaseRepository>;

    beforeEach(() => {
        userRepository = new UserRepository() as jest.Mocked<UserRepository>;
        productRepository = new ProductRepository() as jest.Mocked<ProductRepository>;
        purchaseRepository = new PurchaseRepository() as jest.Mocked<PurchaseRepository>;
        purchaseService = new PurchaseService(userRepository, productRepository, purchaseRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return error if user balance is insufficient', async () => {
        userRepository.findUserBalance.mockResolvedValue({
            error: undefined,
            payload: { balance: 50 },
        });
        productRepository.findProductById.mockResolvedValue({
            error: undefined,
            payload: { id: 2, name: 'Test Product', price: 30 },
        });

        const response = await purchaseService.purchaseProduct(1, 2, 2);

        expect(response.error).toBe(ERRORS.INSUFFICIENT_BALANCE);
        expect(userRepository.findUserBalance).toHaveBeenCalledWith(1);
        expect(productRepository.findProductById).toHaveBeenCalledWith(2);
    });

    it('should return error if product does not exist', async () => {
        userRepository.findUserBalance.mockResolvedValue({
            error: undefined,
            payload: { balance: 100 },
        });
        productRepository.findProductById.mockResolvedValue({
            error: undefined,
            payload: null,
        });

        const response = await purchaseService.purchaseProduct(1, 99, 1);

        expect(response.error).toBe(ERRORS.PRODUCT_NOT_FOUND);
        expect(productRepository.findProductById).toHaveBeenCalledWith(99);
    });

    it('should successfully process a purchase and return updated balance', async () => {
        userRepository.findUserBalance.mockResolvedValue({
            error: undefined,
            payload: { balance: 100 },
        });
        productRepository.findProductById.mockResolvedValue({
            error: undefined,
            payload: { id: 2, name: 'Test Product', price: 30 },
        });
        purchaseRepository.createPurchase.mockResolvedValue({
            error: undefined,
            payload: { id: 1 },
        });
        userRepository.updateUserBalance.mockResolvedValue({
            error: undefined,
            payload: null,
        });

        const response = await purchaseService.purchaseProduct(1, 2, 2);

        expect(response.payload).toEqual({
            balance: 40,
        });
        expect(userRepository.findUserBalance).toHaveBeenCalledWith(1);
        expect(productRepository.findProductById).toHaveBeenCalledWith(2);
        expect(purchaseRepository.createPurchase).toHaveBeenCalledWith(1, 2, 2, 60);
        expect(userRepository.updateUserBalance).toHaveBeenCalledWith(1, 60);
    });

    it('should return error if user does not exist', async () => {
        userRepository.findUserBalance.mockResolvedValue({
            error: undefined,
            payload: null,
        });

        const response = await purchaseService.purchaseProduct(999, 2, 1);

        expect(response.error).toBe(ERRORS.USER_NOT_FOUND);
        expect(userRepository.findUserBalance).toHaveBeenCalledWith(999);
    });
});

