import {BadRequestException} from '@nestjs/common';
import {IsNotEmpty, IsString, validate} from 'class-validator';
import {transformAndValidate} from './validation.util';

// 테스트용 DTO 클래스 정의
class TestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

// 빈 DTO 클래스
class EmptyDto {}

jest.mock('class-validator', () => {
  const originalModule = jest.requireActual('class-validator');
  return {
    ...originalModule,
    validate: jest.fn(),
  };
});

describe('transformAndValidate', () => {
  it('should return a valid DTO instance when validation passes', async () => {
    const plainObject = {name: 'Test Name', description: 'Test Description'};

    (validate as jest.Mock).mockResolvedValue([]);

    const result = await transformAndValidate(TestDto, plainObject);

    expect(result).toBeInstanceOf(TestDto);
    expect(result.name).toBe('Test Name');
    expect(result.description).toBe('Test Description');
  });

  it('should throw BadRequestException when validation fails', async () => {
    const plainObject = {name: '', description: ''};

    (validate as jest.Mock).mockResolvedValue([
      {
        property: 'name',
        constraints: {isNotEmpty: 'name should not be empty'},
      },
      {
        property: 'description',
        constraints: {isNotEmpty: 'description should not be empty'},
      },
    ]);

    await expect(transformAndValidate(TestDto, plainObject)).rejects.toThrow(
      BadRequestException,
    );

    try {
      await transformAndValidate(TestDto, plainObject);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toContain('Validation failed');
    }
  });

  it('should handle partial validation errors', async () => {
    const plainObject = {name: 'Valid Name'};

    (validate as jest.Mock).mockResolvedValue([
      {
        property: 'description',
        constraints: {isNotEmpty: 'description should not be empty'},
      },
    ]);

    await expect(transformAndValidate(TestDto, plainObject)).rejects.toThrow(
      BadRequestException,
    );

    try {
      await transformAndValidate(TestDto, plainObject);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toContain('description should not be empty');
    }
  });

  it('should return an instance when DTO has no validation decorators', async () => {
    const plainObject = {anyField: 'Any Value'};

    (validate as jest.Mock).mockResolvedValue([]);

    const result = await transformAndValidate(EmptyDto, plainObject);

    expect(result).toBeInstanceOf(EmptyDto);
    expect(result).toEqual(plainObject);
  });

  it('should throw BadRequestException when constraints are missing in validation errors', async () => {
    const plainObject = {name: null, description: null};

    (validate as jest.Mock).mockResolvedValue([
      {property: 'name', constraints: undefined},
      {property: 'description', constraints: undefined},
    ]);

    await expect(transformAndValidate(TestDto, plainObject)).rejects.toThrow(
      BadRequestException,
    );

    try {
      await transformAndValidate(TestDto, plainObject);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe('Validation failed: ; ');
    }
  });

  it('should throw BadRequestException for an empty plain object', async () => {
    const plainObject = {};

    (validate as jest.Mock).mockResolvedValue([
      {
        property: 'name',
        constraints: {isString: 'name must be a string'},
      },
      {
        property: 'description',
        constraints: {isString: 'description must be a string'},
      },
    ]);

    await expect(transformAndValidate(TestDto, plainObject)).rejects.toThrow(
      BadRequestException,
    );

    try {
      await transformAndValidate(TestDto, plainObject);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toContain('name must be a string');
    }
  });
});
