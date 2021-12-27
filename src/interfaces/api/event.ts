import { Event, Settlement } from "../event";
import { PaginatedRes } from './common'

export declare interface EventDetailRes extends Event {}

export declare interface EventListRes extends PaginatedRes {
  results?: EventDetailRes[];
}

export declare interface SettlementPreviewRes extends PaginatedRes {
  results?: Settlement[];
}
