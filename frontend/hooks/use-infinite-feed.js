"use client";

import { useCallback, useState } from "react";

import * as api from "../lib/api";

const PAGE_SIZE = 10;

export default function useInfiniteFeed() {
  const [items, setItems] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await api.getFeed({ limit: PAGE_SIZE, offset });
      const nextItems = data.items || [];

      setItems((currentItems) => [...currentItems, ...nextItems]);
      setOffset((currentOffset) => currentOffset + PAGE_SIZE);
      setHasMore(nextItems.length === PAGE_SIZE);
    } catch (feedError) {
      setError(feedError.message);
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, offset]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await api.getFeed({ limit: PAGE_SIZE, offset: 0 });
      const nextItems = data.items || [];

      setItems(nextItems);
      setOffset(PAGE_SIZE);
      setHasMore(nextItems.length === PAGE_SIZE);
    } catch (feedError) {
      setError(feedError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    error,
    hasMore,
    isLoading,
    items,
    loadMore,
    refresh
  };
}
