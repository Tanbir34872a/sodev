import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

describe('UserService', () => {
  let service: UserService;

  const mockSave = jest.fn();

  const mockUserDoc = {
    save: mockSave,
  };

  const mockUserModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
  };

  const mockUserModelConstructor = jest.fn(() => mockUserDoc);

  const jwtServiceMock = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: Object.assign(mockUserModelConstructor, mockUserModel),
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const dto: CreateUserDto = {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123',
        name: 'John Doe',
        bio: '',
        picture_url: '',
      };

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      mockSave.mockResolvedValue({ ...dto, _id: '123' });

      const result = await service.create(dto);

      expect(result.message).toBe('User created successfully');
      expect(result.status).toBe(201);
      expect(mockSave).toHaveBeenCalled();
    });

    it('should throw ConflictException if user already exists', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ username: 'john_doe' }),
      });

      const dto: CreateUserDto = {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123',
        name: 'John Doe',
      };

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const dto: LoginDto = {
        uname_email: 'john_doe',
        password: 'password123',
      };

      const hashedPassword = bcrypt.hashSync('password123', 10);

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          username: 'john_doe',
          email: 'john@example.com',
          _id: '1',
          password: hashedPassword,
        }),
      });

      jwtServiceMock.sign.mockReturnValue('token');

      const result = await service.login(dto);

      expect(result.status).toBe(200);
      expect(result.auth_token).toBe('token');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.login({ uname_email: 'wrong', password: '123' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      const hashedPassword = bcrypt.hashSync('correct-password', 10);

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          username: 'john_doe',
          password: hashedPassword,
        }),
      });

      await expect(
        service.login({ uname_email: 'john_doe', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens', () => {
      const payload = {
        username: 'john',
        email: 'john@example.com',
        userId: '1',
      };

      jwtServiceMock.verify.mockReturnValue(payload);
      jwtServiceMock.sign.mockReturnValue('new_token');

      const result = service.refreshToken('some_token');

      expect(result.status).toBe(200);
      expect(result.auth_token).toBe('new_token');
      expect(result.refresh_token).toBe('new_token');
    });

    it('should throw UnauthorizedException on invalid token', () => {
      jwtServiceMock.verify.mockImplementation(() => {
        throw new Error('Invalid');
      });

      expect(() => service.refreshToken('bad_token')).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('remove', () => {
    it('should mark user as deleted', async () => {
      const user = {
        deleted: false,
        save: jest.fn(),
      };

      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(user),
      });

      const result = await service.remove(1);

      expect(user.deleted).toBe(true);
      expect(user.save).toHaveBeenCalled();
      expect(result.status).toBe(200);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
