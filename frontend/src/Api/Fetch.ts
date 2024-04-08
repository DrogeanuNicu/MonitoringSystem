import { useNavigate } from '@solidjs/router';

const convertUsernameToToken = (username: string): string => {
  return `token_${username}`
}

const storeToken = (username: string, token: string) => {
  localStorage.setItem(convertUsernameToToken(username), token);
}

const loadToken = (username: string): string | null => {
  const token = localStorage.getItem(convertUsernameToToken(username));
  return token
}

const removeToken = (username: string): void => {
  localStorage.removeItem(convertUsernameToToken(username));
}

const authorizedFetch = async (username: string, input: RequestInfo | URL, options: RequestInit): Promise<Response> => {
  try {
    const token = loadToken(username)
    if (!token) {
      const navigate = useNavigate();
      navigate("/");
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

export { authorizedFetch, loadToken, storeToken, removeToken };
