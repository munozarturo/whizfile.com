import * as zod from "zod";
import { SHA256Hash } from "./shared";

const ObjectData = zod.object({
    contents: zod.array(zod.string()),
    size: zod.number(),
    fileHash: SHA256Hash,
});

const TransfersReq = zod.object({
    title: zod.string(),
    message: zod.string(),
    objectData: ObjectData,
});

export { TransfersReq };
