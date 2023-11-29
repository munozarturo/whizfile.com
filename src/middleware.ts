import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
    Collection,
    connectToDatabase,
    dbConnection,
    RequestSchema,
} from "./db/mongo";

export async function middleware(request: NextRequest) {
    const db: dbConnection = await connectToDatabase();
    const requests: Collection<RequestSchema> = db.collections.requests;

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
