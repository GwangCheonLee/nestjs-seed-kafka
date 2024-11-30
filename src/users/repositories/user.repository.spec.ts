import {DataSource} from 'typeorm';
import {Test, TestingModule} from '@nestjs/testing';
import {UserRepository} from './user.repository';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from '../entities/user.entity';
import {setupDataSource} from '../../../jest/setup';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await setupDataSource();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          entities: [User],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([User]),
      ],
      providers: [UserRepository],
    })
      .overrideProvider(DataSource)
      .useValue(dataSource)
      .compile();

    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterEach(async () => {
    await userRepository.clear();
  });

  // eslint-disable-next-line require-jsdoc
  const createTestUser = async (
    email: string,
    plainPassword: string,
    nickname: string = 'nickname',
  ) => {
    return userRepository.signUp(email, nickname);
  };

  describe('User Registration', () => {
    it('should save and return the user', async () => {
      const email = 'test@example.com';
      const nickname = 'nickname';
      const savedUser = await createTestUser(email, 'plainPassword', nickname);

      expect(savedUser).toBeDefined();
      expect(typeof savedUser.id).toBe('number');
      expect(savedUser.email).toBe(email);
      expect(savedUser.nickname).toBe(nickname);
      expect(savedUser.createdAt).toBeInstanceOf(Date);
      expect(savedUser.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Email Registration Check', () => {
    it('should return true if email is already registered', async () => {
      const email = 'registered@example.com';
      await createTestUser(email, 'password');

      const isRegistered = await userRepository.isEmailRegistered(email);
      expect(isRegistered).toBe(true);
    });

    it('should return false if email is not registered', async () => {
      const isRegistered = await userRepository.isEmailRegistered(
        'not_registered@example.com',
      );
      expect(isRegistered).toBe(false);
    });
  });
});
