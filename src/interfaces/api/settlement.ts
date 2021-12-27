import { User } from "../user";
import { PaginatedRes } from "./common";

export declare interface SettlementDetailRes {
  url: string;
  pk: number;
  event: string;
  from_user: User;
  to_user: User;
  is_paid: boolean;
  amount: number;
}

export declare interface SettlementListRes extends PaginatedRes {
  results?: SettlementDetailRes[];
}
