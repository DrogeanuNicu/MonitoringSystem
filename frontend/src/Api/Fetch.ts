const storeToken = (username: string, token: string) => {
    localStorage.setItem(`token_${username}`, token);
}

const loadToken = (username: string): string | null => {
    const token = localStorage.getItem(`token_${username}`);
    return token
}

const authorizedFetch = async (username: string, input: RequestInfo | URL, options: RequestInit): Promise<Response> => {
    try {
        const token = loadToken(username)
        if (!token) {
            throw new Error('Token not found!');
        }

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };

        options.headers = headers;
        const response = await fetch(input, options);

        return response
    } catch (error) {
        throw error;
    }
};

export { authorizedFetch, loadToken, storeToken };
