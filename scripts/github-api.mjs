export function githubClient(token, fetcher = fetch) {
  if (!token) throw new Error("GH_TOKEN is required for GitHub synchronization.");
  return async function request(path, { method = "GET", body, allow404 = false } = {}) {
    const response = await fetcher(`https://api.github.com${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });
    if (allow404 && response.status === 404) return null;
    if (!response.ok) throw new Error(`GitHub ${method} ${path}: HTTP ${response.status}`);
    return response.status === 204 ? null : response.json();
  };
}

export async function allPages(request, path) {
  const result = [];
  for (let page = 1; ; page++) {
    const batch = await request(`${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${page}`);
    if (!Array.isArray(batch)) throw new Error("GitHub returned an invalid page.");
    result.push(...batch);
    if (batch.length < 100) return result;
  }
}
