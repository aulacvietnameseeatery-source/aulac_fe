export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: "/auth/login",
        REGISTER: "/auth/register",
        ME: "/auth/me",
    },
    USERS: {
        LIST: "/users",
        DETAIL: (id: string) => `/users/${id}`,
    },
    // Add more endpoints as features are added
};
