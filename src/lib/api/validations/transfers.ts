import * as zod from "zod";
import { Hash } from "./shared";

const ObjectData = zod.object({
    size: zod.preprocess((input) => {
        if (typeof input === "string") {
            const parsed = Number(input);
            return isNaN(parsed) ? undefined : parsed;
        }
        return input;
    }, zod.number()),
    fileHash: Hash,
});

const TransfersReq = zod.object({
    title: zod.string(),
    message: zod.string(),
    objectData: ObjectData,
});

export { TransfersReq };
