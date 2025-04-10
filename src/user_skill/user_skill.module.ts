import { Module } from '@nestjs/common';
import { UserSkillService } from './user_skill.service';
import { UserSkillController } from './user_skill.controller';

@Module({
  controllers: [UserSkillController],
  providers: [UserSkillService],
})
export class UserSkillModule {}
