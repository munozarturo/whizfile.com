import { rateLimit } from "@/lib/api/rate-limiter";
import { NextRequest } from "next/server";

export async function POST(
    req: NextRequest,
  ) {
    if (await rateLimit(req)) {
      return Response.json({ message: "Rate limit exceeded." }, { status: 429 });
    }
  
    try {
      return Response.json({message: "Hello API"}, { status: 200 });
    } catch (error) {
      console.log(error);
  
      return Response.json(
        { message: "Unknown error.", data: {} },
        { status: 500 }
      );
    }
  }