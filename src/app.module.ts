import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './modules/user/user.module';
import { PostModule } from './modules/post/post.module';
import { CommentModule } from './modules/comment/comment.module';
import { SkillModule } from './skill/skill.module';
import { ExperienceModule } from './modules/experience/experience.module';
import { UserSkillModule } from './modules/user_skill/user_skill.module';
import AppConfig from '@/config/app.config'; // Adjust the import path as necessary

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the ConfigModule available globally
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: `${AppConfig.MONGO_URI}`,
      }),
    }),
    UserModule,
    PostModule,
    CommentModule,
    SkillModule,
    ExperienceModule,
    UserSkillModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
