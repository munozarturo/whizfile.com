import { MongoClient } from "mongodb";

let cachedClient: MongoClient | null = null;

export async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const config = {};
  const uri = process.env.MONGO_URI;

  if (uri === undefined) {
    throw new Error(
      "Please define the MONGO_URI environment variable inside .env"
    );
  }

  const client = await MongoClient.connect(uri, config);

  cachedClient = client;
  return client;
}
