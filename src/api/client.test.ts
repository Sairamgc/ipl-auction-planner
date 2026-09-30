import { describe, expect, it, vi } from "vitest";
import { z, ZodError } from "zod";

import { API_BASE, ApiError, apiRequest } from "./client";

const itemSchema = z.object({ id: z.string() });

function mockFetch(response: Response) {
  const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("apiRequest", () => {
  it("prefixes the path with API_BASE and returns the parsed body", async () => {
    const fetchMock = mockFetch(jsonResponse({ id: "csk" }));

    await expect(apiRequest("/franchises/csk", itemSchema)).resolves.toEqual({
      id: "csk",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE}/franchises/csk`,
      expect.objectContaining({ method: "GET", body: undefined }),
    );
  });

  it("sends the body as JSON", async () => {
    const fetchMock = mockFetch(jsonResponse({ id: "csk" }));

    await apiRequest("/plans/csk", itemSchema, {
      method: "PUT",
      body: { id: "csk" },
    });

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.method).toBe("PUT");
    expect(init?.body).toBe('{"id":"csk"}');
    expect(new Headers(init?.headers).get("Content-Type")).toBe(
      "application/json",
    );
  });

  it("appends search params as the query string", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockImplementation(() => Promise.resolve(jsonResponse({ id: "csk" })));
    vi.stubGlobal("fetch", fetchMock);

    await apiRequest("/pool", itemSchema, {
      searchParams: new URLSearchParams({ role: "batter,bowler", page: "2" }),
    });
    await apiRequest("/pool", itemSchema, {
      searchParams: new URLSearchParams(),
    });

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      `${API_BASE}/pool?role=batter%2Cbowler&page=2`,
      `${API_BASE}/pool`,
    ]);
  });

  it("throws ApiError with the status on a non-2xx response", async () => {
    mockFetch(jsonResponse({ error: "Not Found" }, 404));

    const error = await apiRequest("/plans/xyz", itemSchema).catch(
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 404, path: "/plans/xyz" });
  });

  it("throws ZodError when the body does not match the schema", async () => {
    mockFetch(jsonResponse({ id: 42 }));

    await expect(apiRequest("/franchises/csk", itemSchema)).rejects.toThrow(
      ZodError,
    );
  });
});
