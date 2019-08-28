export interface TV {
  id: string;
  clientAddress: number;
  label: string;
  ip: string;
  reserved?: boolean;
  end?: Date;
  locationName?: string;
}
