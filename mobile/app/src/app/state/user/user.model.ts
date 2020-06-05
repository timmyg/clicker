export interface User {
  sub: string;
  guest?: boolean;
  roles: { [key: string]: any[] };
}
