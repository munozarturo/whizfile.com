import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RequestSchema } from "@/db/mongo";

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
         * Match all request paths except for the ones starting with:
         * - api/requests (API route)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api/requests|_next/static|_next/image|favicon.ico).*)",
    ],
};
