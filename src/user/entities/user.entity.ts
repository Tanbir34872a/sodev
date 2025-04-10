import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ unique: true, required: true })
  username: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop()
  password: string;

  @Prop()
  name: string;

  @Prop()
  bio: string;

  @Prop()
  picture_url: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
