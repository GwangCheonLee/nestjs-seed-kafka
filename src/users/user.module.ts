import {Module} from '@nestjs/common';
import {UserService} from './user.service';
import {UserRepository} from './repositories/user.repository';

/**
 * 사용자 모듈로, 사용자 관련 컨트롤러와 서비스를 관리합니다.
 * @module UserModule
 */
@Module({
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}