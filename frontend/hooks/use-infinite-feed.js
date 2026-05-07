"use client";

import { useCallback, useRef, useState } from "react";

import * as api from "../lib/api";

const PAGE_SIZE = 10;

function mergeUniqueById(currentItems, nextItems) {
  const seenIds = new Set(currentItems.map((item) => item.id));
  const dedupedNextItems = nextItems.filter((item) => {
    if (seenIds.has(item.id)) {
      return false;
    }

    seenIds.add(item.id);
    return true;
  });

  return [...currentItems, ...dedupedNextItems];
}

export default function useInfiniteFeed() {
  const [items, setItems] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const offsetRef = useRef(0);
  const hasMoreRef = useRef(true);
  const isLoadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMoreRef.current) {
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);
    setError("");

    try {
      const data = await api.getFeed({ limit: PAGE_SIZE, offset: offsetRef.current });
      const nextItems = data.items || [];

      setItems((currentItems) => mergeUniqueById(currentItems, nextItems));
      offsetRef.current += PAGE_SIZE;
      hasMoreRef.current = nextItems.length === PAGE_SIZE;
      setOffset(offsetRef.current);
      setHasMore(hasMoreRef.current);
    } catch (feedError) {
      setError(feedError.message);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    isLoadingRef.current = true;
    setIsLoading(true);
    setError("");

    try {
      const data = await api.getFeed({ limit: PAGE_SIZE, offset: 0 });
      const nextItems = data.items || [];

      setItems(nextItems);
      offsetRef.current = PAGE_SIZE;
      hasMoreRef.current = nextItems.length === PAGE_SIZE;
      setOffset(offsetRef.current);
      setHasMore(hasMoreRef.current);
    } catch (feedError) {
      setError(feedError.message);
    } finally {
      isLoadingRef.current = false;
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
