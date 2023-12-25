import { RequestSchema } from "@/lib/db/schema/request";
import { TransferSchema } from "@/lib/db/schema/transfers";
import { Collection, Db, MongoClient } from "mongodb";
import whizfileConfig from "@/lib/config/config";

interface Collections {
    requests: Collection<RequestSchema>;
    transfers: Collection<TransferSchema>;
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
    };

    return collections;
}

export { connectToDatabase, Collection, type Collections };
