import { IUser } from './interfaces';

export class UserUtils {
  static ANONYMOUS_USER: IUser = { name: 'anonymous', roles: ['anonymous'] };
}

export enum EPermission {
  READ = 4,
  WRITE = 2,
  EXECUTE = 1,
}

export enum EEntity {
  USER,
  GROUP,
  OTHERS,
  BUDDIES,
}
