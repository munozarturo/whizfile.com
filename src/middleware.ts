import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RequestSchema } from "@/db/mongo";

/*
 * Middleware must only use code that can run in the edge.
 * - Must use API routes to log requests.
 * - Must use `fetch()` API to make requests to these endpoints because `axios` is not supported in edge.
 * - Matcher for middleware only applies to `/api/`
 * - Matcher for middleware makes sure to exclude `/api/requests` to avoid an infinite request logging.
 */

export async function middleware(req: NextRequest) {
    let source = req.ip ?? req.headers.get("x-real-ip");
    const forwardedFor = req.headers.get("x-forwarded-for");
    if (!source && forwardedFor) {
        source = forwardedFor.split(",").at(0) ?? "unknown";
    }

    const requestTimestamp: number = Date.now();

    const requestMetadata: RequestSchema = {
        timestamp: requestTimestamp,
        method: req.method,
        source: source || "unknown",
        target: req.url,
    };

    const addRequestMetadata = await fetch("/api/requests", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestMetadata),
    });

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths starting with /api/ except for /api/requests
         */
        "/api/((?!requests$).*)",
    ],
};
