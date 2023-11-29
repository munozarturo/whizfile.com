import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
    connectToDatabase,
    Db,
    fetchMongoClient,
    MongoClient,
} from "./db/mongo";
import { dbConfig } from "@/config/db";

export async function middleware(request: NextRequest) {
    const mongoClient: MongoClient = await fetchMongoClient();
    const mainDb: Db = connectToDatabase({
        client: mongoClient,
    });

    const requests = mainDb.collection("requests");

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
