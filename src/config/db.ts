interface Collections {
    requests: string;
}

interface DbConfig {
    rootDb: string;
    collections: Collections;
}

export const dbConfig: DbConfig = {
    rootDb: "main",
    collections: {
        requests: "requests",
    },
};
