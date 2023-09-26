import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { promisify } from 'util';
import { scrypt as _scrypt, randomBytes } from 'crypto';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}
  async signup(email: string, password: string) {
    // checks if email already exist
    const users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('email already exists');
    }

    // hash password
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    const hashedPassword = `${salt}.${hash.toString('hex')}`;
    console.log(hashedPassword);

    // storing user into db
    const user = await this.usersService.create(email, hashedPassword);

    // return user
    return user;
  }
}
