import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
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
