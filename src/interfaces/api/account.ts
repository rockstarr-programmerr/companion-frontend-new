import { User } from '../user'

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

export declare interface RegisterTeacherReq {
  email: string;
  password: string;
  name?: string;
  phone_number?: string;
}

export declare interface RegisterTeacherRes extends User {}

export declare interface MyInfoRes extends User {}

export declare interface UserDetailRes extends User {}

export declare interface UpdateProfileReq {
  name?: User['name'];
  phone_number?: User['phone_number'];
  avatar?: File | null;
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
