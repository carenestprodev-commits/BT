import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BASE_URL } from "../Redux/config";
import { fetchWithAuth } from "../lib/fetchWithAuth";

export function useAdminCollection({ path, params = {}, pageSize = 8 }) {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestRef = useRef(0);
  const query = new URLSearchParams({
    ...params,
    page: String(page),
    page_size: String(pageSize),
  }).toString();

  const load = useCallback(async () => {
    const requestId = ++requestRef.current;
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${BASE_URL}${path}?${query}`);
      const data = await response.json();
      if (!response.ok)
        throw new Error(data?.detail || "Unable to load records.");
      if (requestId !== requestRef.current) return;
      setRows(data.results);
      setCount(data.count);
      setError("");
    } catch (loadError) {
      if (requestId !== requestRef.current) return;
      setError(loadError.message || "Unable to load records.");
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }, [path, query]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return {
    rows,
    page,
    setPage,
    count,
    totalPages,
    pageSize,
    loading,
    error,
    reload: load,
  };
}

export function useClientPagination(
  rows,
  { pageSize = 8, resetKey = "" } = {},
) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));

  useEffect(() => setPage(1), [resetKey]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const visibleRows = useMemo(
    () => rows.slice((page - 1) * pageSize, page * pageSize),
    [page, pageSize, rows],
  );

  return { page, setPage, pageSize, totalPages, visibleRows };
}
