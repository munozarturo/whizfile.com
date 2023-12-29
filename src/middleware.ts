import * as zod from "zod";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { RequestsReq } from "@/lib/api/validations/requests";
import { handleResponse } from "@/lib/api/utils";

/*
 * Middleware must only use code that can run in the edge.
 * - Must use API routes to log requests.
 * - Must use `fetch()` API to make requests to these endpoints because `axios` is not supported in edge.
 * - Matcher for middleware only applies to `/api/`
 * - Matcher for middleware makes sure to exclude `/api/requests` to avoid an infinite request logging.
 */

const SECRET_KEY = process.env.MIDDLEWARE_SECRET_KEY;

if (!SECRET_KEY) {
    throw new Error(
        "`MIDDLEWARE_SECRET_KEY` environment variable is not defined."
    );
}

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!SECRET_KEY) {
    throw new Error(
        "`NEXT_PUBLIC_BASE_URL` environment variable is not defined."
    );
}

export async function middleware(req: NextRequest) {
    try {
        let source = req.ip ?? req.headers.get("x-real-ip");
        const forwardedFor = req.headers.get("x-forwarded-for");
        if (!source && forwardedFor) {
            source = forwardedFor.split(",").at(0) ?? "unknown";
        }

        const requestTimestamp: number = Date.now();

        const requestMetadata: zod.infer<typeof RequestsReq> =
            RequestsReq.parse({
                timestamp: requestTimestamp,
                method: req.method,
                source: source || "unknown",
                target: req.url,
            });

        const postRequest = await fetch(
            `${NEXT_PUBLIC_BASE_URL}/api/requests`,
            {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `${SECRET_KEY}`,
                },
                body: JSON.stringify(requestMetadata),
            }
        );

        const body = await postRequest.json();

        if (body.requests === "limit-exceeded") {
            return NextResponse.json(
                handleResponse("Request rate limit exceeded."),
                {
                    status: 429,
                }
            );
        }
    } catch (e: any) {
        console.log(e);
    } finally {
        return NextResponse.next();
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/requests (API route)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api/requests|_next/static|_next/image|favicon.ico).*)",
    ],
};
