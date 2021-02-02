import BoxLive from './boxLive';

export default class Box {
  id: string;
  label: string;
  region: string;
  zone: string;
  configuration: {
    appActive: boolean;
    automationActive: boolean;
  };
  info: {
    clientAddress: string;
    locationName: string;
    ip: string;
    notes: string;
  };
  live: BoxLive;
  updatedAt: number;
  box: { locked: false };
}
