const API_BASE_URL = "http://localhost:8080";

export async function checkBackend() {
  const response = await fetch(`${API_BASE_URL}/api/health`);

  if (!response.ok) {
    throw new Error("Backend connection failed");
  }

  return response.text();
}