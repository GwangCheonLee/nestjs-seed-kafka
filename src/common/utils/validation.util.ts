import {BadRequestException} from '@nestjs/common';
import {plainToInstance} from 'class-transformer';
import {validate} from 'class-validator';

// eslint-disable-next-line valid-jsdoc
/**
 * 객체를 지정된 DTO 클래스로 변환하고 유효성 검사를 수행하는 함수
 *
 * @template {T extends object} 객체로 변환할 DTO 클래스의 타입
 * @param {new () => T} dtoClass 변환할 DTO 클래스
 * @param {object} plainObject 변환할 평범한 객체
 * @returns {Promise<T>} 유효성 검사를 통과한 DTO 인스턴스
 * @throws {BadRequestException} 유효성 검사에 실패한 경우
 */
export async function transformAndValidate<T extends object>(
  dtoClass: new () => T,
  plainObject: object,
): Promise<T> {
  // 평범한 객체를 DTO 인스턴스로 변환
  const dtoInstance = plainToInstance(dtoClass, plainObject);

  // DTO 유효성 검사
  const errors = await validate(dtoInstance);
  if (errors.length > 0) {
    const errorMessages = errors
      .map((err) => Object.values(err.constraints || {}).join(', '))
      .join('; ');
    throw new BadRequestException(`Validation failed: ${errorMessages}`);
  }

  return dtoInstance;
}
