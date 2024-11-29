import {ConflictException, Injectable} from '@nestjs/common';
import {UserRepository} from './repositories/user.repository';
import {UserRegistrationDto} from './dto/user-registration.dto';

/**
 * 사용자 관련 비즈니스 로직을 처리하는 서비스입니다.
 * @class UserService
 */
@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * 회원 가입 로직.
   *
   * @param {UserRegistrationDto} userRegistrationDto - 회원 가입 요청 데이터
   * @return {void} - 회원 가입 성공 시 void 반환
   */
  async signUp(userRegistrationDto: UserRegistrationDto): Promise<void> {
    const emailExists = await this.userRepository.isEmailRegistered(
      userRegistrationDto.email,
    );

    if (emailExists) {
      throw new ConflictException(
        'This email is already registered. Please use another email.',
      );
    }

    await this.userRepository.signUp(
      userRegistrationDto.email,
      userRegistrationDto.nickname,
    );
  }
}
