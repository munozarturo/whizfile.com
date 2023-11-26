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
};

module.exports = nextConfig;
