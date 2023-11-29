import { dbConfig } from "@/config/db";
import {
    Collection,
    CollectionOptions,
    Db,
    DbOptions,
    MongoClient,
} from "mongodb";

let cachedClient: MongoClient | null = null;

async function fetchMongoClient() {
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

interface DatabaseConnectionParameters {
    client: MongoClient;
    db?: string;
    dbOptions?: DbOptions;
}

function connectToDatabase({
    client,
    db = dbConfig.rootDb,
    dbOptions = undefined,
}: DatabaseConnectionParameters): Db {
    return client.db(db, dbOptions);
}

export { fetchMongoClient, connectToDatabase, MongoClient, Db };
