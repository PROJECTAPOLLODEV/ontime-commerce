"use client";

import { useState } from "react";

export default function AdminSyncPage() {
  const [syncing, setSyncing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const syncAllPages = async () => {
    setSyncing(true);
    setError(null);
    setResults([]);
    setProgress({ current: 0, total: 0 });

    try {
      // First, get page 1 to see total pages
      const firstResp = await fetch("/api/clover-sync?page=1");
      const firstData = await firstResp.json();

      if (!firstData.ok) {
        setError(firstData.error || "Sync failed");
        setSyncing(false);
        return;
      }

      const allResults = [firstData];
      const totalPages = firstData.totalPages || 1;
      setProgress({ current: 1, total: totalPages });

      // Sync remaining pages - ALL of them
      for (let page = 2; page <= totalPages; page++) {
        const resp = await fetch(`/api/clover-sync?page=${page}`);
        const data = await resp.json();
        allResults.push(data);
        setResults([...allResults]);
        setProgress({ current: page, total: totalPages });

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      setResults(allResults);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSyncing(false);
    }
  };

  const syncSinglePage = async (page: number) => {
    setSyncing(true);
    setError(null);

    try {
      const resp = await fetch(`/api/clover-sync?page=${page}`);
      const data = await resp.json();

      if (!data.ok) {
        setError(data.error || "Sync failed");
      } else {
        setResults([data]);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Clover Product Sync</h1>
        <p className="text-sm text-muted-foreground">
          Sync products from Clover API to your database
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Sync Controls</h2>
        <div className="flex gap-3">
          <button
            onClick={() => syncSinglePage(1)}
            disabled={syncing}
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
          >
            Sync Page 1
          </button>
          <button
            onClick={syncAllPages}
            disabled={syncing}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {syncing ? "Syncing..." : "Sync All Products"}
          </button>
        </div>

        {syncing && progress.total > 0 && (
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                Page {progress.current} of {progress.total}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{
                  width: `${(progress.current / progress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Sync Results</h2>
          <div className="space-y-3">
            {results.map((result, idx) => (
              <div
                key={idx}
                className="rounded-md border bg-muted/30 p-4 text-sm"
              >
                <div className="grid gap-2 md:grid-cols-4">
                  <div>
                    <span className="text-muted-foreground">Page:</span>{" "}
                    <strong>{result.page}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Pages:</span>{" "}
                    <strong>{result.totalPages}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Products:</span>{" "}
                    <strong>{result.productsInPage}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Prices Updated:</span>{" "}
                    <strong>{result.pricesUpdated}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-md bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <strong>Total Products Synced:</strong>{" "}
            {results.reduce((sum, r) => sum + (r.productsInPage || 0), 0)}
          </div>
        </div>
      )}
    </div>
  );
}
