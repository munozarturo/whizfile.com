import { apiResponse } from "@/lib/api/utils";
import { RequestSchema } from "@/lib/db/schema/request";
import * as zod from "zod";
import { NextRequest, NextResponse } from "next/server";
import { Collection, Collections, connectToDatabase } from "@/lib/db/mongo";

const SECRET_KEY = process.env.MIDDLEWARE_SECRET_KEY;

if (!SECRET_KEY) {
    throw new Error(
        "`MIDDLEWARE_SECRET_KEY` environment variable is not defined."
    );
}

const LIMIT = Number(process.env.API_RATE_LIMIT_REQS_PER_MIN);

if (!LIMIT) {
    throw new Error(
        "`API_RATE_LIMIT_REQS_PER_MIN` environment variable is not defined."
    );
}

export async function POST(req: NextRequest) {
    if (req.headers.get("Authorization") !== SECRET_KEY) {
        return NextResponse.json(apiResponse("Unathorized"), { status: 401 });
    }

    try {
        const body: zod.infer<typeof RequestSchema> = RequestSchema.parse(
            await req.json()
        );
        const collections: Collections = await connectToDatabase();
        const requests: Collection<zod.infer<typeof RequestSchema>> =
            collections.requests;

        body.timestamp = Date.now();

        await requests.insertOne(body);

        const countBySource: number = await requests.countDocuments({
            source: body.source,
            timestamp: {
                $gt: Date.now() - 1000 * 60,
            },
        });

        return Response.json(
            apiResponse("Request logged sucessfully.", {
                requests:
                    countBySource <= LIMIT ? "within-limit" : "limit-exceeded",
            })
        );
    } catch (e: any) {
        if (e instanceof Error) {
            console.error(e);
        } else if (e instanceof zod.ZodError) {
            console.log(e.message);
        } else {
            console.log("Unknown error.");
        }

        return NextResponse.json(
            apiResponse("Unknown error.", { status: 500 })
        );
    }
}
