/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
            {
                source: "/",
                destination: "/send",
                permanent: true,
            },
        ];
    },
    serverRuntimeConfig: {
        maxBodySize: "50mb",
    },
};

module.exports = nextConfig;
