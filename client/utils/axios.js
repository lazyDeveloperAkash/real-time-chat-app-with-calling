import Axios from 'axios';

Axios.defaults.baseURL = "http://localhost:8080/api";
Axios.defaults.withCredentials = true;

let isRefreshing = false; // Track if a refresh is already in progress
let failedQueue = []; // Queue to hold failed requests while the token is being refreshed

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Add a response interceptor
Axios.interceptors.response.use(
    (response) => {
        return response; // Return the response if no error
    },
    async (error) => {
        const originalRequest = error.config;

        // Check if the error is a 401 and the request hasn't been retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                // Add the request to the queue and wait for the token to be refreshed
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        return Axios(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            isRefreshing = true;

            try {
                // Attempt to refresh the token
                const { data } = await Axios.post('/access-token'); // Adjust the endpoint as needed
                const newAccessToken = data?.accessToken;
                if (newAccessToken) {
                    // Update the Authorization header with the new token
                    Axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                    processQueue(null, newAccessToken);
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return Axios(originalRequest);
                } else {
                    throw new Error("Refresh token failed to return a new access token");
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                // Handle the refresh token failure (e.g., log out the user)
                console.error('Refresh token request failed', refreshError);
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // If it's not a 401 or retry fails, reject the error
        return Promise.reject(error);
    }
);

export default Axios;
