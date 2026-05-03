import mongoose, { Schema, Types } from 'mongoose';
import { IProject } from '../types';

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },
    color: {
      type: String,
      default: '#6366F1',
      match: [/^#[0-9A-Fa-f]{6}$/, 'Please enter a valid hex color']
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        role: {
          type: String,
          enum: ['admin', 'member'],
          default: 'member'
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
projectSchema.index({ owner: 1 });
projectSchema.index({ 'members.user': 1 });

export const Project = mongoose.model<IProject>('Project', projectSchema);