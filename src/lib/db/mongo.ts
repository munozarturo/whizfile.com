import { RequestSchema } from "@/lib/schema/request";
import { Collection, Db, DbOptions, MongoClient } from "mongodb";
import * as zod from "zod";

interface Collections {
    requests: Collection<zod.infer<typeof RequestSchema>>;
}

let cachedClient: MongoClient | null = null;
let cachedConnection: Collections | null = null;

async function fetchMongoClient() {
    if (cachedClient) {
        return cachedClient;
    }

    const config = {};
    const URI = process.env.MONGO_URI;

    if (URI === undefined) {
        throw new Error(
            "Please define the MONGO_URI environment variable inside .env"
        );
    }

    const client = await MongoClient.connect(URI, config);

    cachedClient = client;
    return client;
}

async function connectToDatabase() {
    if (cachedConnection) {
        return cachedConnection;
    }

    const MAIN_DB = process.env.MAIN_DB;

    if (MAIN_DB === undefined) {
        throw new Error(
            "Please define the MAIN_DB environment variable inside .env"
        );
    }

    const mongoClient: MongoClient = await fetchMongoClient();
    const db: Db = mongoClient.db(MAIN_DB);

    const collections: Collections = {
        requests: db.collection("requests"),
    };

    return collections;
}

export { connectToDatabase, Collection, type Collections };
