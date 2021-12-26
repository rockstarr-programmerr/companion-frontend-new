import { User } from "./user";

export declare interface Transaction {
  url: string;
  pk: number;
  event: string;
  transaction_type: 'user_to_user' | 'user_to_fund' | 'fund_to_user' | 'user_expense' | 'fund_expense';
  from_user: User | null;
  to_user: User | null;
  amount: number;
  description: string;
  create_time: string;
  update_time: string;
}
