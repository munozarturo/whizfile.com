import { ObjectId } from "mongodb";

interface Auth {
    uploadCodeVerifSalt: string;
    uploadCodeVerifHash: string;
}

export default class Transfer {
    constructor(
        public transferId: string,
        public createdAt: number,
        public title: string,
        public message: string,
        public auth: Auth,
        public status: string,
        public fileKey: string | null,
        public id?: ObjectId
    ) {}
}
