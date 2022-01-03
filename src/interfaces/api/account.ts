import { User } from '../user'
import { PaginatedRes } from './common';

export declare interface LoginReq {
  email: string;
  password: string;
}

export declare interface LoginRes {
  access: string;
  refresh: string;
}

export declare interface TokenRefreshReq {
  refresh: string;
}

export declare interface TokenRefreshRes {
  access: string;
  refresh: string;
}

export declare interface MyInfoRes extends User {}

export declare interface UserDetailRes extends User {}

export declare interface UpdateProfileReq {
  avatar?: File | null;
  nickname?: string;
}

export declare interface UpdateProfileRes extends User {}

export declare interface ChangePasswordReq {
  current_password: string;
  new_password: string;
}

export declare interface EmailResetPasswordLinkReq {
  email: string;
}

export declare interface ResetPasswordReq {
  uid: string;
  token: string;
  password: string;
}

export declare interface SearchUsersReq {
  nickname_or_email__icontains: string;
  exclude_emails?: string;
}

export declare interface SearchUserDetailRes {
  nickname: string;
  email: string;
  avatar_thumbnail: string | null;
}

export declare interface SearchUserRes extends PaginatedRes {
  results?: SearchUserDetailRes[];
}

export declare interface RegisterUserReq {
  email: string;
  password: string;
}

export declare interface LoginWithGoogleReq {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

export declare interface LoginWithFacebookReq {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

export declare interface FbDataDeletionStatusRes {
  confirmation_code: string;
  status: string;
  issued_at: string;
  expires: string;
}
