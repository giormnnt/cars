import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999) + 1,
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('test@email.com', 'password');
    expect(user.password).not.toEqual('password');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if email already exists', async () => {
    await service.signup('test@email.com', 'password');
    await expect(service.signup('test@email.com', 'password')).rejects.toThrow(
      BadRequestException,
    );
  });

  it("throws an error if user doesn't exist", async () => {
    const user = service.signin('test@email.com', 'password');
    await expect(user).rejects.toThrow(NotFoundException);
  });

  it("throws if password doesn't match", async () => {
    await service.signup('new@email.com', 'password');
    const user = service.signin('new@email.com', 'wrongpassword');
    await expect(user).rejects.toThrow(BadRequestException);
  });

  it('signs in a user if details provided are correct', async () => {
    await service.signup('new@email.com', 'password');
    const user = await service.signin('new@email.com', 'password');

    expect(user).toBeDefined();
  });
});

// describe('AuthService', () => {
//   let service: AuthService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [AuthService],
//     }).compile();

//     service = module.get<AuthService>(AuthService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });
// });
