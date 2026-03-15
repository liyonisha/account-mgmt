const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export async function api(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!res.ok) {
    let message = "Request failed";
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  // 204 No Content (e.g. DELETE) has no body — do not parse as JSON
  if (res.status === 204) {
    return null;
  }

  return res.json();
}

