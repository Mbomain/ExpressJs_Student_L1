import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/UserRepository';
import { signAccessToken } from '../security/jwt';
import { HttpError } from '../security/HttpError';
import { AuthenticatedUser, Credentials, Role, User } from '../models/User';

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(credentials: Credentials, role: Role = 'STUDENT') {
    this.validate(credentials);

    if (await this.userRepository.findByEmail(credentials.email)) {
      throw new HttpError(400, 'Email already exists');
    }

    const passwordHash = await bcrypt.hash(credentials.password, SALT_ROUNDS);
    const user = await this.userRepository.create(credentials.email, passwordHash, role);

    return this.authenticationOf(user);
  }

  async login(credentials: Credentials) {
    this.validate(credentials);

    const user = await this.userRepository.findByEmail(credentials.email);
    if (!user || !(await bcrypt.compare(credentials.password, user.passwordHash))) {
      throw new HttpError(401, 'Invalid credentials');
    }

    return this.authenticationOf(user);
  }

  private authenticationOf({ id, email, role }: User) {
    const user: AuthenticatedUser = { id, email, role };
    return { accessToken: signAccessToken(user), user };
  }

  private validate({ email, password }: Credentials): void {
    if (!EMAIL_PATTERN.test(email?.trim() || '')) throw new HttpError(400, 'Invalid email format');
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      throw new HttpError(400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }
  }
}
