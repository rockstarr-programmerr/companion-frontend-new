import { User } from "./user";

export declare interface Event {
  url: string;
  pk: number;
  name: string;
  qr_code: string;
  creator: User;
  members: User[];
  is_settled: boolean;
  create_time: string;
  transactions_url: string;
  invitations_url: string;
  settlements_url: string;
  extra_action_urls: EventExtraActionUrls;
}

export declare interface EventExtraActionUrls {
  invite_members: string;
  cancel_invite_members: string;
  remove_members: string;
  reset_qr: string;
  chart_info: string;
  preview_settlements: string;
  settle: string;
}