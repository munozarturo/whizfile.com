import * as zod from "zod";

const TransfersReq = zod.object({
    title: zod.string(),
    message: zod.string(),
});

export { TransfersReq };