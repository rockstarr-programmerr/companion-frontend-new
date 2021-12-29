import { Event, Settlement } from "../event";
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
