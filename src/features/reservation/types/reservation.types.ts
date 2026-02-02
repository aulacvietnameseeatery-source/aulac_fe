export type TableStatus = 'available' | 'reserved' | 'selected';

export interface Table {
  id: string;
  name: string;
  guests: number;
  status: TableStatus;
  image: string;
}

export type ZoneName = string;

export type ZoneTables = Record<ZoneName, Table[]>;

export interface GuestInfo {
  name: string;
  phone: string;
  email: string;
}
