import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole, USER_ROLES, ROLE_DEFAULT_PERMISSIONS, PermissionKey } from '../../config/constants.js';

export interface IUser extends Document {
  organizationId: string;
  name: string;
  email: string;
  normalizedEmail: string;
  passwordHash: string;
  role: UserRole;
  permissions: PermissionKey[];
  avatarUrl?: string;
  phone?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  refreshTokens: string[];
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    organizationId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    normalizedEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // Do not return password by default in queries
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.SALES_REP,
      required: true,
    },
    permissions: {
      type: [String],
      default: function () {
        const userRole = this?.role || USER_ROLES.SALES_REP;
        return ROLE_DEFAULT_PERMISSIONS[userRole as UserRole] || [];
      },
    },
    avatarUrl: {
      type: String,
    },
    phone: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: true,
    },
    refreshTokens: {
      type: [String],
      default: [],
      select: false,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Critical compound indexes per specification
UserSchema.index({ organizationId: 1, normalizedEmail: 1 }, { unique: true });
UserSchema.index({ organizationId: 1, role: 1, isActive: 1 });

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const UserModel = mongoose.model<IUser>('User', UserSchema);
