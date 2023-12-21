interface APIConfig {
    rateLimit: number;
    expireInMax: number; // in ms
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
        expireInMax: 60 * 60 * 24 * 7 * 1000, // 7 days in ms
    },
    mongo: {
        mainDb: "test",
    },
    s3: {
        region: "us-east-2",
        bucket: "whizfile-transfers",
        presignedUrlExpireIn: 60,
    },
};

// AWS_BUCKET=whizfile-transfers
// AWS_REGION=us-east-2
// AWS_UPLOAD_EXPIRY_TIME_S=60
// MAIN_DB = test;
// API_RATE_LIMIT_REQS_PER_MIN=20

export default whizfileConfig;
