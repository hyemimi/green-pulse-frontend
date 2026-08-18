const serverUrl = import.meta.env.VITE_SERVER_URL;

if (!serverUrl) {
  throw new Error("VITE_SERVER_URL is not defined");
}

const API_BASE_URL = serverUrl.replace(/\/+$/, "");

export function serverApiUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function fetchServerJson<T>(path: string): Promise<T> {
  const response = await fetch(serverApiUrl(path));

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }

  return response.json() as Promise<T>;
}
