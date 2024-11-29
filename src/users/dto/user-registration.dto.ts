import {IsEmail, IsString} from 'class-validator';

/**
 * 사용자 등록 이벤트 메시지 DTO
 */
export class UserRegistrationDto {
  /**
   * 사용자 이메일 주소
   */
  @IsEmail()
  email: string;

  /**
   * 사용자 닉네임
   */
  @IsString()
  nickname: string;
}
