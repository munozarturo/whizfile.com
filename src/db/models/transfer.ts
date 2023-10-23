import { ObjectId } from "mongodb";

export default class Request {
  constructor(
    public transferId: string,
    public source: string,
    public createdAt: number,
    public status: string,
    public title: string,
    public message: string,
    public id?: ObjectId
  ) {}
}
