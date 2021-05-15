import { ObjectId } from 'mongodb'
import { Manager } from '../Manager/Manager'
import { TimeRule } from '../Rule/Rule'
import { Device, TimeRange, Violation } from './Device'

export interface VehicleOptions {
  _id: ObjectId;
  id: number;
  numbers: string;
  type: string;
  driverId: number;
  timeRange: TimeRange;
  openTimeRule: boolean;
  device: number;
}

export class Vehicle extends Device {
  public objectId: ObjectId;
  public numbers: string;
  public type: string;
  public driverId: number;
  public device: number;
  public timeRule?: TimeRule;

  private constructor(opts: VehicleOptions) {
    super({ id: opts.id, timeRange: opts.timeRange })
    this.objectId = opts._id
    this.numbers = opts.numbers
    this.type = opts.type
    this.driverId = opts.driverId
    this.device = opts.device
    if (opts.openTimeRule && this.device) {
      this.timeRule = new TimeRule(this.id)
      this.timeRule?.open()
    }
  }

  pushViolation(violation: Violation): void {
    Manager.getInstance().workerMap.get(this.driverId)?.pushViolation(violation)
  }

  public async destory(): Promise<void> {
    await this.timeRule?.close()
  }

  public static deserialize(opts: VehicleOptions): Vehicle {
    return new Vehicle(opts)
  }
}