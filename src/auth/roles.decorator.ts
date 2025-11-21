import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../user/user.entity';

export const Roles = (role: UserRole) => SetMetadata('role', role);