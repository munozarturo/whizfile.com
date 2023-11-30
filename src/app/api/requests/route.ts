import { apiResponse } from "@/lib/api/utils";
import { RequestSchema } from "@/lib/validations/request";
import * as zod from "zod";
import { NextRequest } from "next/server";
import { Collection, Collections, connectToDatabase } from "@/lib/db/mongo";

const SECRET_KEY = process.env.MIDDLEWARE_SECRET_KEY;

if (!SECRET_KEY) {
    throw new Error(
        "`MIDDLEWARE_SECRET_KEY` environment variable is not defined."
    );
}

export async function POST(req: NextRequest) {
    if (req.headers.get("Authorization") !== SECRET_KEY) {
        return Response.json(apiResponse("Unathorized"), { status: 401 });
    }

    try {
        const body: zod.infer<typeof RequestSchema> = RequestSchema.parse(req);
        const collections: Collections = await connectToDatabase();
        const requests: Collection<zod.infer<typeof RequestSchema>> =
            collections.requests;

        return Response.json({ message: "Hello from /api/requests" });
    } catch (e: any) {
        if (e instanceof Error) {
            console.error(e);
        } else if (e instanceof zod.ZodError) {
            console.log(e.message);
        } else {
            console.log("Unknown error.");
        }
    }
}
