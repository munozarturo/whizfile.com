interface TransferConfig {
    maxSize: number; // in bytes
    maxTitleLength: number;
    maxMessageLength: number;
    expireInMin: number;
    expireInMax: number;
    maxDownloadsMin: number;
    maxDownloadsMax: number;
    maxViewsMin: number;
    maxViewsMax: number;
}

interface APIConfig {
    rateLimit: number;
    transfer: TransferConfig;
}

interface MongoDBConfig {
    mainDb: string;
}

interface S3Config {
    bucket: string;
    region: string;
    presignedUrlExpireIn: number; // in s
}

interface WhizfileConfig {
    api: APIConfig;
    mongo: MongoDBConfig;
    s3: S3Config;
}

const whizfileConfig: WhizfileConfig = {
    api: {
        rateLimit: 20,
        transfer: {
            maxSize: 1000000000, // 1GB
            maxTitleLength: 200,
            maxMessageLength: 1000,
            expireInMin: 0,
            expireInMax: 60 * 60 * 24 * 7 * 1000, // 7 days in ms
            maxDownloadsMin: 1,
            maxDownloadsMax: 999,
            maxViewsMin: 1,
            maxViewsMax: 999,
        },
    },
    mongo: {
        mainDb: "test",
    },
    s3: {
        region: "us-east-2",
        bucket: "whizfile-transfers",
        presignedUrlExpireIn: 60 * 60, // 1 hour
    },
};

export default whizfileConfig;
