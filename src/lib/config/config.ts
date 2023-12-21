interface APIConfig {
    expireInMax: number;
}

interface WhizfileConfig {
    api: APIConfig;
}

const whizfileConfig: WhizfileConfig = {
    api: {
        expireInMax: 60 * 60 * 24 * 7 * 1000, // 7 days in ms
    },
};

export default whizfileConfig;
