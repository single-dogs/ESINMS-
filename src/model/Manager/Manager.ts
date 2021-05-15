import {
  collections,
} from '../DB'
import { Vehicle, VehicleOptions } from '../Device/Vehicle'
import { Worker, WorkerOptions } from '../Device/Worker'

/**
 * 单例
 */
export class Manager {
  public static instance: Manager;
  public workerMap: Map<number, Worker>;
  public vehicleMap: Map<number, Vehicle>;

  private constructor() {
    this.workerMap = new Map()
    this.vehicleMap = new Map()
    this._deserialize()
  }

  private _deserialize(): void {
    collections.Worker.find({}).toArray((err, workers) => {
      if (err) {
        return console.log(err)
      }
      workers.forEach((worker: WorkerOptions) => {
        const workerObj = Worker.deserialize(worker)
        this.workerMap.set(worker.id, workerObj)
      })
    })
    collections.Vehicle.find({}).toArray((err, vehicles) => {
      if (err) {
        return console.log(err)
      }
      vehicles.forEach((vehicle: VehicleOptions) => {
        const vehicleObj = Vehicle.deserialize(vehicle)
        this.vehicleMap.set(vehicle.id, vehicleObj)
        return
      })
    })
  }

  public addWorker(workerOpts: any | WorkerOptions): void {
    this.workerMap.set(workerOpts.id, Worker.deserialize(workerOpts))
  }

  public delWorker(id: number): void {
    this.workerMap.delete(id)
  }

  public reloadWorker(id: number, newObj: any | WorkerOptions): void {
    // todo 车辆驾驶员关联
    this.delWorker(id)
    this.addWorker(newObj)
  }

  static getInstance(): Manager {
    if (!Manager.instance) {
      Manager.instance = new Manager()
    }
    return this.instance
  }
}

declare module 'koa' {
  interface DefaultContext {
    manager: Manager;
  }
}

export function managerContext(): any {
  const manager = Manager.getInstance()
  return async (ctx: any, next: any): Promise<any> => {
    ctx.manager = manager
    await next()
  }
}