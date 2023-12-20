import { handleError, handleResponse } from "@/lib/api/utils";
import * as zod from "zod";
import { NextRequest, NextResponse } from "next/server";
import { Collection, Collections, connectToDatabase } from "@/lib/db/mongo";
import { TransfersReq } from "@/lib/api/validations/transfers";
import { TransferSchema } from "@/lib/db/schema/transfers";

export async function POST(req: NextRequest) {
    try {
        // parse input
        const body: zod.infer<typeof TransfersReq> = TransfersReq.parse(
            await req.json()
        );

        // connect to db
        const collections: Collections = await connectToDatabase();
        const transfers: Collection<zod.infer<typeof TransferSchema>> =
            collections.transfers;

        // api endpoint body

        // standard response
        return NextResponse.json(
            handleResponse("Response message.", { hash: "" }),
            { status: 200 }
        );
    } catch (e: any) {
        return NextResponse.json(handleError(e));
    }
}
