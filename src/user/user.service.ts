import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';
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
      return {
        message: 'User already exists',
        status: 409,
      };
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
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
