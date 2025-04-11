import { ConflictException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}
  private readonly logger = new Logger(UserService.name);

  async create(createUserDto: CreateUserDto) {
    try {
      this.logger.log('Creating a new user');
      this.logger.debug(`User data: ${JSON.stringify(createUserDto)}`);

      const existingUser = await this.userModel
        .findOne({
          $or: [
            { username: createUserDto.username },
            { email: createUserDto.email },
          ],
        })
        .exec();

      if (existingUser) {
        this.logger.warn('User already exists');
        throw new ConflictException('User already exists');
      }

      this.logger.log('Hashing password');
      const passwordHash = bcrypt.hashSync(createUserDto.password, 10);
      const newUser = new this.userModel({
        ...createUserDto,
        password: passwordHash,
      });

      await newUser.save();
      this.logger.log('User created successfully');
      this.logger.debug(`New user data: ${JSON.stringify(newUser)}`);

      return {
        message: 'User created successfully',
        status: 201,
        user: newUser,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error('Error creating user', error.stack);
      throw new Error('Error creating user');
    }
  }

  async login(loginDto: LoginDto) {
    this.logger.log('User login attempt');
    this.logger.debug(`Login data: ${JSON.stringify(loginDto)}`);

    const user = await this.userModel
      .findOne({
        $or: [
          { username: loginDto.uname_email },
          { email: loginDto.uname_email },
        ],
      })
      .exec();

    if (!user) {
      this.logger.warn('User not found');
      throw new NotFoundException('Username or Email is not found');
    }

    const isPasswordValid = bcrypt.compareSync(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      this.logger.warn('Invalid password');
      throw new UnauthorizedException('Invalid password');
    }

    const payload = {
      username: user.username,
      email: user.email,
      userId: user._id,
    };
    const token = this.jwtService.sign(payload);

    this.logger.log('User logged in successfully');
    return {
      message: 'Login successful',
      status: 200,
      authorization: `${token}`,
      user,
    };
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    this.logger.log('Updating user');
    this.logger.debug(`User ID: ${id}`);
    this.logger.debug(`Update data: ${JSON.stringify(updateUserDto)}`);
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
