import { handleResponse } from "@/lib/api/utils";
import * as zod from "zod";
import { NextRequest, NextResponse } from "next/server";
import { Collection, Collections, connectToDatabase } from "@/lib/db/mongo";
import { RequestSchema } from "@/lib/db/schema/request";
import { RequestsReq } from "@/lib/api/validations/requests";

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
        return NextResponse.json(handleResponse("Unathorized"), {
            status: 401,
        });
    }

    try {
        const body: zod.infer<typeof RequestsReq> = RequestsReq.parse(
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
            handleResponse("Request logged sucessfully.", {
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
            handleResponse("Unknown error.", { status: 500 })
        );
    }
}
