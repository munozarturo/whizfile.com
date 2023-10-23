import { connectToDatabase } from "@/db/mongo";

export async function GET(req: Request) {
  const client = await connectToDatabase();
  const db = client.db("main");
  const transfers = db.collection("transfers");

  const resp = await transfers.find({}).toArray();

  return Response.json({ message: "Hello world", data: resp }, { status: 200 });
}
