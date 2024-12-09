import {Test, TestingModule} from '@nestjs/testing';
import {KafkaConsumerService} from './kafka-consumer.service';
import {UserService} from '../../users/user.service';
import {UserRegistrationMessage} from '../../users/interfaces/user-registration-message.interface';
import {UserRegistrationDto} from '../../users/dto/user-registration.dto';
import {transformAndValidate} from '../../common/utils/validation.util';

jest.mock('../../common/utils/validation.util');

const mockUserService = {
  signUp: jest.fn(),
};

describe('KafkaConsumerService', () => {
  let service: KafkaConsumerService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KafkaConsumerService,
        {provide: UserService, useValue: mockUserService},
      ],
    }).compile();

    service = module.get<KafkaConsumerService>(KafkaConsumerService);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processUserRegistrationEvent', () => {
    it('should process a user registration event successfully', async () => {
      const message: UserRegistrationMessage = {
        email: 'test@example.com',
        nickname: 'testuser',
      };

      const validatedDto: UserRegistrationDto = {
        email: 'test@example.com',
        nickname: 'testuser',
      };

      (transformAndValidate as jest.Mock).mockResolvedValue(validatedDto);
      mockUserService.signUp.mockResolvedValue(undefined);

      await service.processUserRegistrationEvent(message);

      expect(transformAndValidate).toHaveBeenCalledWith(
        UserRegistrationDto,
        message,
      );
      expect(userService.signUp).toHaveBeenCalledWith(validatedDto);
    });

    it('should log an error if validation fails', async () => {
      const message: UserRegistrationMessage = {
        email: 'test@example.com',
        nickname: 'testuser',
      };

      (transformAndValidate as jest.Mock).mockRejectedValue(
        new Error('Validation error'),
      );

      await expect(
        service.processUserRegistrationEvent(message),
      ).rejects.toThrow('Validation error');

      expect(transformAndValidate).toHaveBeenCalledWith(
        UserRegistrationDto,
        message,
      );
      expect(userService.signUp).not.toHaveBeenCalled();
    });

    it('should log an error if signUp fails', async () => {
      const message: UserRegistrationMessage = {
        email: 'test@example.com',
        nickname: 'testuser',
      };

      const validatedDto: UserRegistrationDto = {
        email: 'test@example.com',
        nickname: 'testuser',
      };

      (transformAndValidate as jest.Mock).mockResolvedValue(validatedDto);
      mockUserService.signUp.mockRejectedValue(new Error('SignUp error'));

      await expect(
        service.processUserRegistrationEvent(message),
      ).rejects.toThrow('SignUp error');

      expect(transformAndValidate).toHaveBeenCalledWith(
        UserRegistrationDto,
        message,
      );
      expect(userService.signUp).toHaveBeenCalledWith(validatedDto);
    });
  });
});
