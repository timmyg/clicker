import Program from '../program';
const moment = require('moment');

export default class ControlCenterProgram {
  fields: {
    start: Date;
    rating: number;
    programmingId: string;
    title: string;
    targetingIds: string[];
    tuneEarly: number;
  };
  db: Program;
  constructor(obj: any) {
    Object.assign(this, obj);
  }
  isMinutesFromNow(minutes: number) {
    return moment(this.fields.start).diff(moment(), 'minutes') <= minutes;
  }
}
