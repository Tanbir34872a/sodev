import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthGuard } from '@nestjs/passport';
import { Authenticated } from '@/decorators/auth.decorator';
import { CurrentUser } from '@/decorators/current-user.decorator';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Body() createPostDto: CreatePostDto,
    @Request() req: { user: { userId: string } },
  ) {
    console.log('Req:', req);
    return this.postService.create(createPostDto, req.user.userId);
  }

  @Authenticated()
  @Get()
  findAll(@CurrentUser('userId') userId: string) {
    console.log('User ID:', userId);
    return this.postService.findAll();
  }

  @Authenticated()
  @Get('author/:id')
  findByAuthor(@Param('id') id: string) {
    console.log('Author ID:', id);
    return this.postService.findByAuthor(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(+id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(+id);
  }
}
