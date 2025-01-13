import bcrypt from 'bcrypt';
import { UserRepository } from "../../repositories/user.repository";
import { CommonServiceResponse } from "../../common/types/commonServiceResponse.type";
import { ERRORS } from "../constants/errors";

export class AuthService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async register(email: string, password: string): CommonServiceResponse<{ id: number; email: string }> {
        const { payload: existingUser } = await this.userRepository.findUserByEmail(email);

        if (existingUser !== null && existingUser !== undefined) {
            return { error: ERRORS.USER_ALREADY_EXISTS };
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const { error, payload } = await this.userRepository.createUser(email, passwordHash);

        if (error || !payload) {
            return { error };
        }

        return { payload };
    }

    async login(email: string, password: string): CommonServiceResponse<{ id: number; email: string }> {
        const { error, payload: user } = await this.userRepository.findUserByEmail(email);

        if (error) {
            return { error };
        }

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return { error: ERRORS.INVALID_CREDENTIALS };
        }

        return { payload: { id: user.id, email: user.email } };
    }

    async changePassword(email: string, oldPassword: string, newPassword: string): CommonServiceResponse<null> {
        const { error, payload: user } = await this.userRepository.findUserByEmail(email);

        if (error) {
            return { error };
        }

        if (!user || !(await bcrypt.compare(oldPassword, user.password_hash))) {
            return { error: ERRORS.INVALID_CREDENTIALS };
        }

        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        const updateResponse = await this.userRepository.updateUserPassword(email, newPasswordHash);

        if (updateResponse.error) {
            return { error: ERRORS.PASSWORD_CHANGE_FAILED };
        }

        return { payload: null };
    }
}
