import { ObjectId } from "mongodb";

export default class Transfer {
  constructor(
    public transferId: string,
    public createdAt: number,
    public status: string,
    public title: string,
    public message: string,
    public id?: ObjectId
  ) {}
}
