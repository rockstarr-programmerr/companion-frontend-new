export declare interface User {
  pk: number;
  url: string;
  name: string;
  email: string;
  phone_number: string;
  user_type: 'teacher' | 'student';
  avatar: string | null;
  avatar_thumbnail: string | null;
  last_login: string | null;
}
