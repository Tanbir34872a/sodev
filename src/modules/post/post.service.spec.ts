import { Model } from 'mongoose';
import { PostDocument } from './entities/post.entity';
import { ReactionDocument } from './entities/reaction.entity';
import { PostService } from './post.service';
import { Logger } from '@nestjs/common';
import { IPost } from '@/interfaces/post.interface';
import { IError } from '@/interfaces/error.interface';

describe('PostService', () => {
  let service: PostService;
  let postModel: jest.Mocked<Model<PostDocument>>;
  let reactionModel: jest.Mocked<Model<ReactionDocument>>;
  let logger: jest.Mocked<Logger>;

  beforeEach(() => {
    postModel = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      aggregate: jest.fn(),
      countDocuments: jest.fn(),
    } as any;

    reactionModel = {
      findOne: jest.fn(),
      create: jest.fn(),
    } as any;

    logger = {
      log: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    } as any;

    service = new PostService(postModel, reactionModel);
    (service as any).logger = logger;
  });

  describe('findOne', () => {
    it('should return 404 if post is not found', async () => {
      postModel.findOne.mockResolvedValue(null);

      const result = await service.findOne('post123');

      expect(result).toEqual({
        message: 'Post not found',
        statusCode: 404,
      });
    });

    it('should fetch a single post successfully', async () => {
      const post = {
        _id: 'post123',
        title: 'Post 1',
        content: 'Content',
        user: 'user123',
        deleted: false,
        createdAt: new Date(),
      } as unknown as IPost;

      postModel.findOne.mockResolvedValue(post);

      const result = await service.findOne('post123');

      expect(postModel.findOne).toHaveBeenCalledWith({
        _id: 'post123',
        deleted: false,
      });
      expect(result).toEqual(post);
    });
  });

  describe('update', () => {
    it('should update a post successfully', async () => {
      const post = {
        _id: 'post123',
        title: 'Old Title',
        content: 'Old Content',
        user: 'user123',
        deleted: false,
        createdAt: new Date(),
        save: jest.fn(),
      } as unknown as IPost;

      jest.spyOn(service, 'findOne').mockResolvedValue(post);

      const updatePostDto = { title: 'Updated Title' };
      const result = await service.update('post123', 'user123', updatePostDto);

      expect(post.save).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Post updated successfully',
        status: 200,
        post,
      });
    });

    it('should return 401 if user is unauthorized', async () => {
      const post = {
        _id: 'post123',
        title: 'Old Title',
        content: 'Old Content',
        user: 'user456',
        deleted: false,
        createdAt: new Date(),
      } as unknown as IPost;

      jest.spyOn(service, 'findOne').mockResolvedValue(post);

      const updatePostDto = { title: 'Updated Title' };
      const result = await service.update('post123', 'user123', updatePostDto);

      expect(result).toEqual({
        message: 'Unauthorized update attempt',
        statusCode: 401,
      });
    });
  });

  describe('remove', () => {
    it('should delete a post successfully', async () => {
      const post = {
        _id: 'post123',
        title: 'Post Title',
        content: 'Post Content',
        user: 'user123',
        deleted: false,
        createdAt: new Date(),
        save: jest.fn(),
      } as unknown as IPost;

      jest.spyOn(service, 'findOne').mockResolvedValue(post);

      const result = await service.remove('post123');

      expect(post.deleted).toBe(true);
      expect(post.save).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Post deleted successfully',
        status: 200,
        post,
      });
    });
  });
});
