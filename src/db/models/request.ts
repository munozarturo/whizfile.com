import { ObjectId } from "mongodb";

export default class Request {
  constructor(
    public ip: string | null,
    public time: number,
    public method: string,
    public url: string,
    public id?: ObjectId
  ) {}
}
