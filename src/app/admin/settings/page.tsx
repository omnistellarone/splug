"use client";

import * as React from "react";
import { Truck, CheckCircle2, AlertCircle, Loader2 } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getStoreSettingsAction,
  updateFreeShippingThresholdAction,
  type StoreSettings,
} from "@/lib/settings/actions";
import { formatMoney } from "@/lib/money";

export default function AdminSettingsPage() {
  const [settings, setSettings] = React.useState<StoreSettings | null>(null);
  const [thresholdNaira, setThresholdNaira] = React.useState<string>("100000");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  React.useEffect(() => {
    getStoreSettingsAction().then((data) => {
      setSettings(data);
      const naira = Math.round(data.freeShippingThresholdMinor / 100);
      setThresholdNaira(naira.toString());
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(thresholdNaira);
    if (isNaN(val) || val < 0) {
      setStatus({
        type: "error",
        message: "Please enter a valid positive Naira amount.",
      });
      return;
    }

    setSaving(true);
    setStatus(null);

    const result = await updateFreeShippingThresholdAction(val);
    if (result.success) {
      setStatus({
        type: "success",
        message: `Free shipping threshold updated to ₦${val.toLocaleString()} (${formatMoney(
          result.thresholdMinor || val * 100
        )})`,
      });
      if (settings && result.thresholdMinor) {
        setSettings({
          ...settings,
          freeShippingThresholdMinor: result.thresholdMinor,
        });
      }
    } else {
      setStatus({
        type: "error",
        message: result.error || "Failed to update threshold.",
      });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        <p className="text-sm text-[var(--text-muted)] font-medium">
          Loading store settings…
        </p>
      </div>
    );
  }

  const numericVal = parseFloat(thresholdNaira) || 0;
  const previewMinor = numericVal * 100;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Store Operations & Delivery Settings
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Configure storefront thresholds, delivery incentives, and operational parameters.
        </p>
      </div>

      {status && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-sm font-medium ${
            status.type === "success"
              ? "bg-[var(--feedback-success-bg)] border-[var(--feedback-success-border)] text-[var(--feedback-success-text)]"
              : "bg-[var(--feedback-danger-bg)] border-[var(--feedback-danger-border)] text-[var(--feedback-danger-text)]"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      {/* Free Delivery Threshold Card */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Free Delivery Threshold Banner
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Set the minimum order cart value required for customers to unlock free shipping nationwide.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="max-w-md space-y-2">
            <label
              htmlFor="threshold"
              className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block"
            >
              Threshold Amount in Naira (₦)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--text-muted)]">
                ₦
              </span>
              <Input
                id="threshold"
                type="number"
                min="0"
                step="1000"
                value={thresholdNaira}
                onChange={(e) => setThresholdNaira(e.target.value)}
                placeholder="100000"
                className="pl-8 text-base font-semibold"
                required
              />
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Currently: <strong>{formatMoney(previewMinor)}</strong> ({previewMinor} kobo minor units).
            </p>
          </div>

          {/* Live Preview Box */}
          <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-2">
            <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
              Customer Cart Banner Preview
            </span>
            <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
              <Truck className="h-4 w-4 text-[var(--primary)] shrink-0" />
              <span>
                Add{" "}
                <strong className="text-[var(--primary)]">
                  {formatMoney(Math.max(0, previewMinor - 3500000))}
                </strong>{" "}
                for FREE delivery
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] italic">
              (Example preview shown for a cart with ₦35,000 subtotal)
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="font-semibold gap-2 shadow-sm"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving Changes…</span>
                </>
              ) : (
                <span>Save Threshold</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
