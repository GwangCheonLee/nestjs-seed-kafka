import {DataSource, Repository} from 'typeorm';
import {Injectable} from '@nestjs/common';
import {User} from '../entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  /**
   * 새로운 사용자를 등록합니다.
   *
   * @param {string} email - 사용자의 이메일
   * @param {string} nickname - 사용자의 닉네임
   * @return {Promise<User>} - 생성된 사용자 엔터티
   */
  signUp(email: string, nickname: string): Promise<User> {
    return this.save({
      email: email,
      nickname: nickname,
    });
  }

  /**
   * 이메일이 이미 등록되었는지 확인합니다.
   *
   * @param {string} email - 확인할 이메일
   * @return {Promise<boolean>} - 이메일이 등록된 경우 true, 그렇지 않으면 false
   */
  async isEmailRegistered(email: string): Promise<boolean> {
    const userQuery = this.createQueryBuilder('user').where(
      'user.email = :email',
      {email},
    );
    const existingUser = await userQuery.getOne();

    return !!existingUser;
  }
}
