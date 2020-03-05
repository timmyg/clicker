export interface TV {
  id: string;
  clientAddress: number;
  label: string;
  ip: string;
  locked?: boolean;
  end?: Date;
  locationName?: string;
}
