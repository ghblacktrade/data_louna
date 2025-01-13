import { UserRepository } from "../../../repositories/user.repository";
import { AuthService } from "./../auth.service";
import bcrypt from 'bcrypt';
import { ERRORS as SERVICE_ERROR} from "../../constants/errors";
import { ERRORS as REPOSITORY_ERROR } from "@src/repositories/constants/errors";

jest.mock('@src/repositories/user.repository');
jest.mock('bcrypt');

describe('AuthService - register', () => {
    let authService: AuthService;
    let userRepository: jest.Mocked<UserRepository>;

    beforeEach(() => {
        userRepository = {
            createUser: jest.fn(),
            findUserByEmail: jest.fn(),
            updateUserPassword: jest.fn(),
        } as unknown as jest.Mocked<UserRepository>;

        authService = new AuthService();
        authService['userRepository'] = userRepository;
    });

    it('should return error if user already exists', async () => {
        userRepository.findUserByEmail.mockResolvedValue({
            payload: { id: 1, email: 'test@example.com', password_hash: 'hashedPassword' },
        });

        const result = await authService.register('test@example.com', 'password123');

        expect(result).toEqual({ error: SERVICE_ERROR.USER_ALREADY_EXISTS });
        expect(userRepository.findUserByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should create new user and return payload', async () => {
        userRepository.findUserByEmail.mockResolvedValue({ payload: null });
        userRepository.createUser.mockResolvedValue({
            payload: { id: 1, email: 'test@example.com' },
        });
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

        const result = await authService.register('test@example.com', 'password123');

        expect(result).toEqual({
            payload: { id: 1, email: 'test@example.com' },
        });
        expect(userRepository.findUserByEmail).toHaveBeenCalledWith('test@example.com');
        expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
        expect(userRepository.createUser).toHaveBeenCalledWith('test@example.com', 'hashedPassword');
    });

    it('should return error if user fail', async () => {
        userRepository.findUserByEmail.mockResolvedValue({ payload: null });
        userRepository.createUser.mockResolvedValue({ error: REPOSITORY_ERROR.FAILED_TO_CREATE });
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

        const result = await authService.register('test@example.com', 'password123');

        expect(result).toEqual({ error: REPOSITORY_ERROR.FAILED_TO_CREATE });
        expect(userRepository.findUserByEmail).toHaveBeenCalledWith('test@example.com');
        expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
        expect(userRepository.createUser).toHaveBeenCalledWith('test@example.com', 'hashedPassword');
    });

});
