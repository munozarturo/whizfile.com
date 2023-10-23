import { ObjectId } from "mongodb";

export default class Request {
  constructor(public id?: ObjectId) {}
}
