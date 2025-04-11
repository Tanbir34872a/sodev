import { Injectable, Logger } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@/user/entities/user.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: Model<Post>,
  ) {}

  private readonly logger = new Logger(PostService.name);

  async create(createPostDto: CreatePostDto, by: string) {
    try {
      this.logger.log('Post created by:', by);

      const newPost = new this.postModel({
        ...createPostDto,
        user: by,
      });
      this.logger.debug('New post data:', newPost);
      await newPost.save();
      return {
        message: 'Post created successfully',
        status: 201,
        post: newPost,
      };
    } catch (error) {
      this.logger.error('Error creating post:', error);
      throw new Error('Error creating post');
    }
  }

  async findAll() {
    try {
      this.logger.log('Fetching all posts');
      const posts = await this.postModel.find().populate(User.name);
      this.logger.debug('Posts:', posts);
      return posts;
    } catch (error) {
      this.logger.error('Error fetching posts:', error);
      throw new Error('Error fetching posts');
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
