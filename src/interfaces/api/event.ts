import { Event, Settlement } from "../event";
import { User } from "../user";
import { PaginatedRes } from './common'

export declare interface EventDetailRes extends Event {}

export declare interface EventListRes extends PaginatedRes {
  results?: EventDetailRes[];
}

export declare interface EventUpdateReq {
  name: string;
}

export declare interface EventUpdateReqErrs {
  name: string[];
}

export declare interface SettlementPreviewRes extends PaginatedRes {
  results?: Settlement[];
}

export declare interface RemoveMembersReq {
  member_pks: number[];
}

export declare interface EventInvitationDetailRes {
  url: string;
  pk: number;
  event: string;
  user: {
    nickname: User['nickname'],
    email: User['email'],
    avatar: User['avatar'],
  };
  status: 'pending' | 'accepted' | 'declined';
  create_time: string;
  update_time: string;
}

export declare interface EventInivitationsListRes extends PaginatedRes {
  results?: EventInvitationDetailRes[];
}
