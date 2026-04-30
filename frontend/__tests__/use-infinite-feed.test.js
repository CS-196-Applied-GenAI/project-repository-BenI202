import { act, renderHook, waitFor } from "@testing-library/react";

import useInfiniteFeed from "../hooks/use-infinite-feed";
import * as api from "../lib/api";

jest.mock("../lib/api");

describe("useInfiniteFeed", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("loads and refreshes feed items", async () => {
    api.getFeed
      .mockResolvedValueOnce({
        items: [{ id: 1 }, { id: 2 }]
      })
      .mockResolvedValueOnce({
        items: [{ id: 3 }]
      });

    const { result } = renderHook(() => useInfiniteFeed());

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.items).toEqual([{ id: 1 }, { id: 2 }]);

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.items).toEqual([{ id: 3 }]);
  });

  test("captures feed errors", async () => {
    api.getFeed.mockRejectedValue(new Error("Feed failed"));

    const { result } = renderHook(() => useInfiniteFeed());

    await act(async () => {
      await result.current.loadMore();
    });

    await waitFor(() => expect(result.current.error).toBe("Feed failed"));
  });
});
