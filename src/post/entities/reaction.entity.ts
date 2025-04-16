import { User } from '@/user/entities/user.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as schema } from 'mongoose';
import { Post } from './post.entity';

export type ReactionDocument = HydratedDocument<Reaction>;

@Schema()
export class Reaction {
  @Prop({ type: schema.Types.ObjectId, ref: User.name, required: true })
  user: User;

  @Prop({ type: schema.Types.ObjectId, ref: Post.name, required: true })
  post: Post;

  @Prop({
    enum: ['Like', 'Dislike', 'Neutral'],
    required: true,
    default: 'Neutral',
  })
  status: string; //Like/Dislike/Neutral

  timestamps: true;
}

export const ReactionSchema = SchemaFactory.createForClass(Reaction);
