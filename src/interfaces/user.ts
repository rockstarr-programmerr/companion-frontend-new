export declare interface User {
  avatar: string | null;
  avatar_thumbnail: string | null;
  email: string;
  event_invitations_url: string;
  nickname: string;
  pk: number;
  url: string;
}

declare interface _Creator {
  nickname: string;
  email: string;
  avatar: string | null;
  avatar_thumbnail: string | null;
}

declare interface _Event {
  name: string;
  creator: _Creator;
}

export declare interface EventInvitation {
  url: string;
  pk: number;
  event: _Event;
  status: 'pending' | 'accepted' | 'declined';
  create_time: string;
  update_time: string;
  accept_invitation_url: string;
  decline_invitation_url: string;
}
