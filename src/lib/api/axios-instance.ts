import axios from "axios";

if (!process.env.NEXT_PUBLIC_BASE_URL) {
    throw new Error("`NEXT_PUBLIC_BASE_URL` not defined.");
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    // You can add other global settings here, like headers
});

export default axiosInstance;
