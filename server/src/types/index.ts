import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IProject extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  color: string;
  owner: Types.ObjectId;
  members: Array<{
    user: Types.ObjectId;
    role: 'admin' | 'member';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITask extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  project: Types.ObjectId;
  assignee?: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthRequest extends Express.Request {
  userId?: string;
}

export interface JwtPayload {
  userId: string;
}