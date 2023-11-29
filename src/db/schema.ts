import { ObjectId } from "mongodb";

class RequestSchema {
    constructor(
        public timestamp: number,
        public method: string,
        public source: string,
        public target: string,
        public id?: ObjectId
    ) {}
}

export { RequestSchema };
