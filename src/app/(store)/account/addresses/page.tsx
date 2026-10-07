"use client";

import * as React from "react";
import Link from "next/link";
import {
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  Building,
} from "@/components/ui/icons";
import {
  getUserAddressesAction,
  saveAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/lib/checkout/actions";
import type { Address } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NIGERIAN_STATES = [
  "Lagos",
  "Abuja (FCT)",
  "Rivers",
  "Oyo",
  "Kano",
  "Ogun",
  "Enugu",
  "Delta",
  "Edo",
  "Kaduna",
  "Anambra",
  "Akwa Ibom",
  "Imo",
  "Abia",
  "Osun",
  "Kwara",
  "Plateau",
  "Other",
];

export default function AddressesPage() {
  const [addresses, setAddresses] = React.useState<Address[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form state
  const [label, setLabel] = React.useState("Home");
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [addressLine1, setAddressLine1] = React.useState("");
  const [addressLine2, setAddressLine2] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [isDefault, setIsDefault] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const refreshAddresses = React.useCallback(async () => {
    const data = await getUserAddressesAction();
    setAddresses(data);
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    getUserAddressesAction().then((data) => {
      if (isMounted) {
        setAddresses(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim() || !phone.trim() || !addressLine1.trim() || !city.trim() || !state.trim()) {
      setFormError("Please fill in all required fields (including state).");
      return;
    }

    setIsSubmitting(true);
    const res = await saveAddressAction({
      label,
      full_name: fullName.trim(),
      phone: phone.trim(),
      address_line1: addressLine1.trim(),
      address_line2: addressLine2.trim() || undefined,
      city: city.trim(),
      state,
      is_default: isDefault || addresses.length === 0,
    });
    setIsSubmitting(false);

    if (res.success) {
      setShowAddForm(false);
      setFullName("");
      setPhone("");
      setAddressLine1("");
      setAddressLine2("");
      setCity("");
      refreshAddresses();
    } else {
      setFormError(res.error || "Failed to save address.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this address?")) return;
    await deleteAddressAction(id);
    refreshAddresses();
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultAddressAction(id);
    refreshAddresses();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors mb-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Account</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Saved Delivery Addresses
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Manage your home and office shipping destinations for quick checkout
          </p>
        </div>

        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="font-semibold gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>{showAddForm ? "Cancel" : "Add Address"}</span>
        </Button>
      </div>

      {/* Add Address Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddAddress}
          className="rounded-2xl border border-[var(--primary)]/40 bg-[var(--surface)] p-6 space-y-4 shadow-lg animate-in fade-in-0 duration-200"
        >
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            Add New Delivery Address
          </h2>

          {formError && (
            <div className="p-3 rounded-lg bg-[var(--danger-soft)] text-[var(--danger)] text-xs">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="addrLabel" className="text-xs font-semibold">
                Label (e.g. Home, Office)
              </Label>
              <Input
                id="addrLabel"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="addrName" className="text-xs font-semibold">
                Full Name *
              </Label>
              <Input
                id="addrName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Recipient name"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="addrPhone" className="text-xs font-semibold">
                Phone Number *
              </Label>
              <Input
                id="addrPhone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08012345678"
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="addrLine1" className="text-xs font-semibold">
              Street Address *
            </Label>
            <Input
              id="addrLine1"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="House number, street name"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="addrLine2" className="text-xs font-semibold">
              Apartment / Suite / Landmark (Optional)
            </Label>
            <Input
              id="addrLine2"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              placeholder="Flat 2B, near bank"
              className="h-9 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="addrCity" className="text-xs font-semibold">
                City / Area *
              </Label>
              <Input
                id="addrCity"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Lekki / Ikeja"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="addrState" className="text-xs font-semibold">
                State *
              </Label>
              <select
                id="addrState"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              >
                <option value="">Select Delivery State *</option>
                {NIGERIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded text-[var(--primary)] focus:ring-[var(--primary)]"
            />
            <Label htmlFor="isDefault" className="text-xs cursor-pointer font-medium">
              Set as my default shipping address
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="font-semibold">
              {isSubmitting ? "Saving…" : "Save Address"}
            </Button>
          </div>
        </form>
      )}

      {/* Address List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-2">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
          <span className="text-xs text-[var(--text-muted)]">Loading addresses…</span>
        </div>
      ) : addresses.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-12 text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-xl bg-[var(--surface-subtle)] text-[var(--text-muted)] flex items-center justify-center">
            <MapPin className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-[var(--text-primary)]">
              No saved addresses yet
            </h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
              Add your delivery addresses to enjoy seamless, 1-click checkout.
            </p>
          </div>
          <Button onClick={() => setShowAddForm(true)} size="sm" className="font-semibold">
            Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={cn(
                "rounded-2xl border p-5 bg-[var(--surface)] flex flex-col justify-between space-y-4 transition-all",
                addr.is_default
                  ? "border-[var(--primary)] shadow-sm"
                  : "border-[var(--border)] hover:border-[var(--border-strong)]"
              )}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-[var(--primary)]" />
                    <span className="font-bold text-sm text-[var(--text-primary)]">
                      {addr.label || "Address"}
                    </span>
                  </div>
                  {addr.is_default && (
                    <Badge variant="secondary" className="text-[10px] py-0 font-semibold">
                      Default
                    </Badge>
                  )}
                </div>

                <div className="text-xs space-y-0.5 text-[var(--text-secondary)]">
                  <p className="font-semibold text-[var(--text-primary)]">
                    {addr.full_name} ({addr.phone})
                  </p>
                  <p>{addr.address_line1}</p>
                  {addr.address_line2 && <p>{addr.address_line2}</p>}
                  <p>
                    {addr.city}, {addr.state}, Nigeria
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] text-xs">
                {!addr.is_default ? (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-[var(--primary)] hover:underline font-semibold flex items-center gap-1"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Set as Default</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-[var(--success)] font-semibold flex items-center gap-1">
                    ✓ Default delivery
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => handleDelete(addr.id)}
                  aria-label="Delete address"
                  className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
