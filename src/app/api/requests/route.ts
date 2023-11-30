import { apiResponse } from "@/lib/api/utils";
import { NextApiRequest } from "next";
import { NextRequest } from "next/server";

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

    const body: null = null;

    return Response.json({ message: "Hello from /api/requests" });
}
