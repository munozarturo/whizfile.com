import { rateLimit } from "@/lib/api/rate-limiter";
import { fileQuerySchema } from "@/lib/validations/transfer";
import { NextRequest } from "next/server";

export async function GET(
    req: NextRequest,
    context: { readonly params: { readonly fileId: string } }
  ) {
    if (await rateLimit(req)) {
      return Response.json({ message: "Rate limit exceeded." }, { status: 429 });
    }

    try {
      const input = fileQuerySchema.parse({
        fileId: context.params.fileId,
      })

      

      return Response.json({fileId: input.fileId}, { status: 200 });
    } catch (error) {
      console.log(error);
  
      return Response.json(
        { message: "Unknown error.", data: {} },
        { status: 500 }
      );
    }
  }