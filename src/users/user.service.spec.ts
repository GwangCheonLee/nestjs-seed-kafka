import {Test, TestingModule} from '@nestjs/testing';
import {ConfigService} from '@nestjs/config';
import {UserRepository} from './repositories/user.repository';
import {ConflictException} from '@nestjs/common';
import {UserService} from './user.service';
import {User} from './entities/user.entity';
import {UserRegistrationDto} from './dto/user-registration.dto';

describe('UsersService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<UserRepository>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    userRepository = {
      isEmailRegistered: jest.fn(),
      signUp: jest.fn(),
    } as Partial<UserRepository> as jest.Mocked<UserRepository>;

    configService = {
      get: jest.fn(),
    } as Partial<ConfigService> as jest.Mocked<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {provide: UserRepository, useValue: userRepository},
        {provide: ConfigService, useValue: configService},
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('signUp', () => {
    it('should throw ConflictException if email is already registered', async () => {
      userRepository.isEmailRegistered.mockResolvedValueOnce(true);

      const signUpDto = {
        email: 'test@example.com',
        nickname: 'testUser',
      };

      await expect(service.signUp(signUpDto)).rejects.toThrow(
        ConflictException,
      );
      expect(userRepository.isEmailRegistered).toHaveBeenCalledWith(
        signUpDto.email,
      );
    });
    it('should create a new user', async () => {
      userRepository.isEmailRegistered.mockResolvedValueOnce(false);

      const savedUser: User = {
        email: 'test@example.com',
        nickname: 'testUser',
      } as User;

      userRepository.signUp.mockResolvedValueOnce(savedUser);

      const signUpDto: UserRegistrationDto = {
        email: 'test@example.com',
        nickname: 'testUser',
      };

      const result = await service.signUp(signUpDto);

      expect(userRepository.signUp).toHaveBeenCalledWith(
        signUpDto.email,
        signUpDto.nickname,
      );
      expect(result).toBeUndefined();
    });
  });
});
