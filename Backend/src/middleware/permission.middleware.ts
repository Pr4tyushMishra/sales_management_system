import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/AppError.js';
import { PermissionKey, USER_ROLES } from '../config/constants.js';

/**
 * Factory middleware to require one or more permission keys
 */
export function requirePermission(...requiredPermissions: PermissionKey[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      return next(AppError.unauthorized());
    }

    // Super Admin bypasses domain permission restrictions
    if (user.role === USER_ROLES.SUPER_ADMIN) {
      return next();
    }

    const userPermissions = user.permissions || [];
    const hasAll = requiredPermissions.every((perm) => userPermissions.includes(perm));

    if (!hasAll) {
      return next(
        AppError.forbidden(
          `Access denied. Required permission: [${requiredPermissions.join(', ')}]`
        )
      );
    }

    next();
  };
}

/**
 * Require at least one of the provided permissions
 */
export function requireAnyPermission(...permissions: PermissionKey[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      return next(AppError.unauthorized());
    }

    if (user.role === USER_ROLES.SUPER_ADMIN) {
      return next();
    }

    const userPermissions = user.permissions || [];
    const hasAny = permissions.some((perm) => userPermissions.includes(perm));

    if (!hasAny) {
      return next(
        AppError.forbidden(
          `Access denied. Requires at least one of: [${permissions.join(', ')}]`
        )
      );
    }

    next();
  };
}
