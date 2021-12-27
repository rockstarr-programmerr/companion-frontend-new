import { Transaction } from "../transaction";
import { PaginatedRes } from "./common";

export declare interface TransactionCreateReq {
  event: string;
  transaction_type: 'user_to_user' | 'user_to_fund' | 'fund_to_user' | 'user_expense' | 'fund_expense';
  from_user: string | null;
  to_user: string | null;
  amount: number | null;
  description: string;
}

export declare interface TransactionDetailRes extends Transaction {}

export declare interface TransactionListRes extends PaginatedRes {
  results?: TransactionDetailRes[]
}
