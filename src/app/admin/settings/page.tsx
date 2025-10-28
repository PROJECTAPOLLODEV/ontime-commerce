"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [markupPercent, setMarkupPercent] = useState(0);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) {
        console.error("Failed to load settings:", res.status, res.statusText);
        alert(`Failed to load settings: ${res.status} ${res.statusText}`);
        setLoading(false);
        return;
      }
      const data = await res.json();
      console.log("Loaded settings:", data);
      setMarkupPercent(data.pricing?.markupPercent || 0);
    } catch (err) {
      console.error("Error loading settings:", err);
      alert(`Error loading settings: ${err}`);
    }
    setLoading(false);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      console.log("Saving pricing settings:", { markupPercent });
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pricing: { markupPercent },
        }),
      });
      console.log("Save response status:", res.status);
      if (res.ok) {
        const saved = await res.json();
        console.log("Settings saved successfully:", saved);
        alert("Pricing settings saved successfully!");
        await loadSettings();
      } else {
        const errorText = await res.text();
        console.error("Error saving settings:", res.status, errorText);
        alert(`Error saving settings: ${res.status} - ${errorText}`);
      }
    } catch (err) {
      console.error("Exception saving settings:", err);
      alert(`Exception saving settings: ${err}`);
    }
    setSaving(false);
  };

  const applyBulkChange = (changePercent: number) => {
    const newMarkup = Math.max(0, Math.min(100, markupPercent + changePercent));
    setMarkupPercent(newMarkup);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pricing Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage global pricing and markup for all products
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/homepage"
              className="rounded-lg border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Homepage Settings →
            </Link>
            <Link
              href="/admin"
              className="rounded-lg border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              ← Back to Admin
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          {/* Global Markup */}
          <div className="rounded-xl border bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Global Markup</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  This markup is applied to all product prices displayed on the site
                </p>
              </div>
              <div className="rounded-lg bg-primary/10 px-4 py-2">
                <div className="text-2xl font-bold text-primary">{markupPercent}%</div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Slider */}
              <div>
                <label className="block text-sm font-medium">Markup Percentage</label>
                <div className="mt-2 flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.5"
                    value={markupPercent}
                    onChange={(e) => setMarkupPercent(Number(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={markupPercent}
                    onChange={(e) => setMarkupPercent(Number(e.target.value))}
                    className="w-24 rounded-md border bg-background px-3 py-2 text-sm"
                  />
                  <span className="text-sm font-medium text-muted-foreground">%</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="mb-3 text-sm font-medium">Quick Adjustments</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => applyBulkChange(-10)}
                    className="rounded-md border bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent"
                  >
                    -10%
                  </button>
                  <button
                    onClick={() => applyBulkChange(-5)}
                    className="rounded-md border bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent"
                  >
                    -5%
                  </button>
                  <button
                    onClick={() => applyBulkChange(-1)}
                    className="rounded-md border bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent"
                  >
                    -1%
                  </button>
                  <button
                    onClick={() => setMarkupPercent(0)}
                    className="rounded-md border bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent"
                  >
                    Reset to 0%
                  </button>
                  <button
                    onClick={() => applyBulkChange(1)}
                    className="rounded-md border bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent"
                  >
                    +1%
                  </button>
                  <button
                    onClick={() => applyBulkChange(5)}
                    className="rounded-md border bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent"
                  >
                    +5%
                  </button>
                  <button
                    onClick={() => applyBulkChange(10)}
                    className="rounded-md border bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent"
                  >
                    +10%
                  </button>
                </div>
              </div>

              {/* Example Calculation */}
              <div className="rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background p-6">
                <p className="mb-3 font-semibold">Pricing Examples</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between rounded-md bg-background p-3">
                    <span className="text-muted-foreground">Base Price: $50.00</span>
                    <span className="font-semibold">→ Customer Pays: ${(50 * (1 + markupPercent / 100)).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-background p-3">
                    <span className="text-muted-foreground">Base Price: $100.00</span>
                    <span className="font-semibold">→ Customer Pays: ${(100 * (1 + markupPercent / 100)).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-background p-3">
                    <span className="text-muted-foreground">Base Price: $250.00</span>
                    <span className="font-semibold">→ Customer Pays: ${(250 * (1 + markupPercent / 100)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Industry Standard Presets */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Industry Presets</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Common markup percentages used in different industries
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <button
                onClick={() => setMarkupPercent(20)}
                className="rounded-lg border bg-muted/30 p-4 text-left transition-all hover:border-primary hover:bg-primary/10"
              >
                <div className="text-2xl font-bold text-primary">20%</div>
                <div className="mt-1 text-sm font-medium">Wholesale</div>
                <div className="mt-1 text-xs text-muted-foreground">Low-margin, high-volume</div>
              </button>
              <button
                onClick={() => setMarkupPercent(30)}
                className="rounded-lg border bg-muted/30 p-4 text-left transition-all hover:border-primary hover:bg-primary/10"
              >
                <div className="text-2xl font-bold text-primary">30%</div>
                <div className="mt-1 text-sm font-medium">Standard Retail</div>
                <div className="mt-1 text-xs text-muted-foreground">Balanced approach</div>
              </button>
              <button
                onClick={() => setMarkupPercent(50)}
                className="rounded-lg border bg-muted/30 p-4 text-left transition-all hover:border-primary hover:bg-primary/10"
              >
                <div className="text-2xl font-bold text-primary">50%</div>
                <div className="mt-1 text-sm font-medium">Premium</div>
                <div className="mt-1 text-xs text-muted-foreground">Higher-end products</div>
              </button>
              <button
                onClick={() => setMarkupPercent(100)}
                className="rounded-lg border bg-muted/30 p-4 text-left transition-all hover:border-primary hover:bg-primary/10"
              >
                <div className="text-2xl font-bold text-primary">100%</div>
                <div className="mt-1 text-sm font-medium">Keystone</div>
                <div className="mt-1 text-xs text-muted-foreground">Double the cost</div>
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3 rounded-xl border bg-card p-6">
            <button
              onClick={loadSettings}
              className="rounded-lg border px-6 py-2.5 font-medium hover:bg-accent"
            >
              Reset Changes
            </button>
            <button
              onClick={saveSettings}
              disabled={saving}
              className="rounded-lg bg-primary px-6 py-2.5 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Pricing Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
