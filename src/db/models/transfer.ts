import { ObjectId } from "mongodb";

export default class Transfer {
    constructor(
        public transferId: string,
        public createdAt: number,
        public title: string,
        public message: string,
        public uploadCodeVerifSalt: string,
        public uploadCodeVerifHash: string,
        public status: string,
        public fileKey: string | null,
        public id?: ObjectId
    ) {}
}
