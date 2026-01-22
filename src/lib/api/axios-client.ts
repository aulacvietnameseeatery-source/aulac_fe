import axios from "axios";

// TODO: Move this to env config
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.aulac.com";

export const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosClient.interceptors.request.use(
    (config) => {
        // TODO: Add auth token here from store/cookies if exists
        // const token = useAuthStore.getState().token;
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        // Handle specific error cases (e.g., 401 Unauthorized)
        if (error.response?.status === 401) {
            // TODO: Handle logout or refresh token
        }
        return Promise.reject(error);
    }
);
