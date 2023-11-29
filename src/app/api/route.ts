import { NextApiRequest } from "next";
import { NextResponse } from "next/server";

export function GET(req: NextApiRequest) {
    return NextResponse.json({ message: "Hello World!" }, { status: 200 });
}
