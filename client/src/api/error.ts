import { isAxiosError } from "axios";

// Body shape our server returns on failed requests: { error: "..." }
interface ApiErrorBody {
    error?: string;
}

// Pull the server's human-readable message out of a failed request.
// Falls back when the failure never reached the server (network down,
// timeout) or wasn't an axios error at all (a bug in our own code).
export const getApiError = (e: unknown, fallback: string): string => {
    if (isAxiosError<ApiErrorBody>(e) && e.response?.data?.error) {
        return e.response.data.error;
    }
    return fallback;
};

// For callers that need to branch on status (401 vs 409 etc.).
// Returns undefined when there was no HTTP response.
export const getApiStatus = (e: unknown): number | undefined => {
    return isAxiosError(e) ? e.response?.status : undefined;
};
