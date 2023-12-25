import * as zod from "zod";

import { Collection, Collections, connectToDatabase } from "@/lib/db/mongo";
import { NextRequest, NextResponse } from "next/server";

import { RequestSchema } from "@/lib/db/schema/request";
import { RequestsReq } from "@/lib/api/validations/requests";
import { handleResponse } from "@/lib/api/utils";
import whizfileConfig from "@/lib/config/config";

if (!process.env.MIDDLEWARE_SECRET_KEY) {
    throw new Error(
        "`MIDDLEWARE_SECRET_KEY` environment variable is not defined."
    );
}

const SECRET_KEY = process.env.MIDDLEWARE_SECRET_KEY;

export async function POST(req: NextRequest) {
    if (req.headers.get("Authorization") !== SECRET_KEY) {
        return NextResponse.json(handleResponse("Unauthorized."), {
            status: 401,
        });
    }

    let body: zod.infer<typeof RequestsReq>;
    let requestBody: Object;
    let collections: Collections;
    let requests: Collection<RequestSchema>;
    let countBySource: number;

    try {
        requestBody = await req.json();
    } catch (e: any) {
        return NextResponse.json(handleResponse("Bad request body."), {
            status: 400,
        });
    }

    try {
        body = RequestsReq.parse(requestBody);
    } catch (e: any) {
        return NextResponse.json(
            handleResponse("Invalid request body.", { request: requestBody }),
            {
                status: 400,
            }
        );
    }

    try {
        collections = await connectToDatabase();
        requests = collections.requests;
    } catch (e: any) {
        return NextResponse.json(
            handleResponse(
                "Error connecting to database. Please try again later.",
                {
                    requestBody: requestBody,
                }
            ),
            {
                status: 500,
            }
        );
    }

    try {
        body.timestamp = Date.now();
        await requests.insertOne(body);

        countBySource = await requests.countDocuments({
            source: body.source,
            timestamp: {
                $gt: Date.now() - 1000 * 60, // 1 minute ago
            },
        });
    } catch (e: any) {
        return NextResponse.json(
            handleResponse("Error fetching previous requests.", {
                requestBody: requestBody,
            }),
            { status: 500 }
        );
    }

    return NextResponse.json(
        handleResponse("Request logged sucessfully.", {
            requests:
                countBySource <= whizfileConfig.api.rateLimit
                    ? "within-limit"
                    : "limit-exceeded",
        })
    );
}
