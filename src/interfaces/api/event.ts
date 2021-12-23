import { Event } from "../event";
import { PaginatedRes } from './common'

export declare interface EventDetailRes extends Event {}

export declare interface EventListRes extends PaginatedRes {
  results?: EventDetailRes[];
}
