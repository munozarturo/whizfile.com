import { RequestSchema } from "@/lib/db/schema/request";
import { TransferIdSchema, TransferSchema } from "@/lib/db/schema/transfers";
import { Collection, Db, DbOptions, MongoClient } from "mongodb";
import * as zod from "zod";
import whizfileConfig from "../config/config";

interface Collections {
    requests: Collection<zod.infer<typeof RequestSchema>>;
    transfers: Collection<zod.infer<typeof TransferSchema>>;
    transferIds: Collection<zod.infer<typeof TransferIdSchema>>;
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

    const mongoClient: MongoClient = await fetchMongoClient();
    const db: Db = mongoClient.db(whizfileConfig.mongo.mainDb);

    const collections: Collections = {
        requests: db.collection("requests"),
        transfers: db.collection("transfers"),
        transferIds: db.collection("transferids"),
    };

    return collections;
}

export { connectToDatabase, Collection, type Collections };
