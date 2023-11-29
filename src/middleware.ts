import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
    Collection,
    Collections,
    RequestSchema,
    connectToDatabase,
} from "@/db/mongo";

export async function middleware(request: NextRequest) {
    const collections: Collections = await connectToDatabase();
    const requests: Collection<RequestSchema> = collections.requests;

    const dbQueryResponse = collections.requests.findOne() as unknown as
        | RequestSchema
        | undefined;

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/api/:path*",
    ],
};
