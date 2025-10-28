"use client";

import { useState, useEffect } from "react";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    pricing: {
      markupPercent: 0,
    },
    homepage: {
      bannerImage: "",
      bannerHeading: "",
      bannerSub: "",
      brandLogos: [] as string[],
    },
  });

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
      setSettings(data);
    } catch (err) {
      console.error("Error loading settings:", err);
      alert(`Error loading settings: ${err}`);
    }
    setLoading(false);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      console.log("Saving settings:", settings);
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      console.log("Save response status:", res.status);
      if (res.ok) {
        const saved = await res.json();
        console.log("Settings saved successfully:", saved);
        alert("Settings saved successfully!");
        // Reload to confirm
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

  if (loading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Pricing Settings */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Pricing</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">
              Global Markup Percentage: {settings.pricing.markupPercent}%
            </label>
            <p className="mb-3 text-xs text-muted-foreground">
              This markup is applied to all product prices displayed on the site
            </p>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={settings.pricing.markupPercent}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    pricing: { markupPercent: Number(e.target.value) },
                  })
                }
                className="w-full max-w-md"
              />
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.pricing.markupPercent}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    pricing: { markupPercent: Number(e.target.value) },
                  })
                }
                className="w-24 rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="mt-3 rounded-md bg-muted p-3 text-sm">
              <p className="font-medium">Example:</p>
              <p className="text-muted-foreground">
                Product base price: $100.00 → Customer sees: $
                {(100 * (1 + settings.pricing.markupPercent / 100)).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Homepage Settings */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Homepage Banner</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Banner Image URL</label>
            <input
              type="text"
              value={settings.homepage.bannerImage}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  homepage: { ...settings.homepage, bannerImage: e.target.value },
                })
              }
              className="mt-1 w-full rounded-md border bg-background px-3 py-2"
              placeholder="/hero.jpg or https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Banner Heading</label>
            <input
              type="text"
              value={settings.homepage.bannerHeading}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  homepage: { ...settings.homepage, bannerHeading: e.target.value },
                })
              }
              className="mt-1 w-full rounded-md border bg-background px-3 py-2"
              placeholder="Your Industrial Partner"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Banner Subtitle</label>
            <textarea
              value={settings.homepage.bannerSub}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  homepage: { ...settings.homepage, bannerSub: e.target.value },
                })
              }
              className="mt-1 w-full rounded-md border bg-background px-3 py-2"
              rows={2}
              placeholder="Quality signage & materials..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Brand Logos (one URL per line)
            </label>
            <textarea
              value={settings.homepage.brandLogos.join("\n")}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  homepage: {
                    ...settings.homepage,
                    brandLogos: e.target.value.split("\n").filter((s) => s.trim()),
                  },
                })
              }
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 font-mono text-sm"
              rows={5}
              placeholder="/brand1.png&#10;/brand2.png&#10;https://example.com/brand3.png"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-3">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
        <button
          onClick={loadSettings}
          className="rounded-md border px-6 py-2 text-sm font-medium hover:bg-accent"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
