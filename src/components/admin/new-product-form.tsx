"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  Image as ImageIcon,
  Link as LinkIcon,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "@/components/ui/icons";
import { createProductAction } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category, Brand } from "@/lib/types/database";

interface NewProductFormProps {
  categories: Category[];
  brands: Brand[];
}

export function NewProductForm({ categories, brands }: NewProductFormProps) {
  const router = useRouter();

  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [autoSlug, setAutoSlug] = React.useState(true);
  const [categoryId, setCategoryId] = React.useState("");
  const [brandId, setBrandId] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [sku, setSku] = React.useState("");
  const [priceNaira, setPriceNaira] = React.useState("");
  const [stock, setStock] = React.useState("10");

  // Image mode: "file" or "url"
  const [imageMode, setImageMode] = React.useState<"file" | "url">("file");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [filePreview, setFilePreview] = React.useState<string | null>(null);
  const [imageUrl, setImageUrl] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  // Auto-generate slug and SKU from title and brand
  const handleNameChange = (val: string) => {
    setName(val);
    if (autoSlug) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generatedSlug);
    }
  };

  const handleGenerateSku = () => {
    const brandObj = brands.find((b) => b.id === brandId);
    const prefix = (brandObj?.name || "SLURGE").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
    const namePart = name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setSku(`${prefix}-${namePart || "PROD"}-${randomSuffix}`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setFilePreview(objectUrl);
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    setImageUrl("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("slug", slug);
      formData.set("categoryId", categoryId);
      formData.set("brandId", brandId);
      formData.set("description", description);
      formData.set("sku", sku);
      formData.set("priceNaira", priceNaira);
      formData.set("stock", stock);

      if (imageMode === "file" && selectedFile) {
        formData.set("imageFile", selectedFile);
      } else if (imageMode === "url" && imageUrl.trim()) {
        formData.set("imageUrl", imageUrl.trim());
      }

      const res = await createProductAction(formData);

      if (!res.success) {
        setErrorMessage(res.error || "Failed to create product listing.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      router.push("/admin/products");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network or server failure.";
      setErrorMessage(msg);
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-sm">
      {errorMessage && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs sm:text-sm text-red-500">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <div className="flex-1">
            <p className="font-semibold">Unable to publish product</p>
            <p className="mt-0.5 text-xs text-red-400/90">{errorMessage}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs sm:text-sm text-emerald-500">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>Product created successfully! Redirecting to products list...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: General Info */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
            General Information
          </h2>

          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold text-[var(--text-secondary)]">
              Product Title *
            </Label>
            <Input
              id="name"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="slug" className="text-xs font-semibold text-[var(--text-secondary)]">
                URL Slug *
              </Label>
              <button
                type="button"
                onClick={() => setAutoSlug(!autoSlug)}
                className="text-[11px] text-[var(--primary)] hover:underline"
              >
                {autoSlug ? "Customize Slug" : "Auto-generate from Title"}
              </button>
            </div>
            <div className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3">
              <span className="text-xs text-[var(--text-muted)] select-none">/product/</span>
              <input
                id="slug"
                required
                disabled={autoSlug}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full h-10 bg-transparent text-xs text-[var(--text-primary)] focus:outline-none disabled:opacity-70"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="categoryId" className="text-xs font-semibold text-[var(--text-secondary)]">
                Category *
              </Label>
              <select
                id="categoryId"
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brandId" className="text-xs font-semibold text-[var(--text-secondary)]">
                Brand *
              </Label>
              <select
                id="brandId"
                required
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="">Select a brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold text-[var(--text-secondary)]">
              Product Description
            </Label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed technical specifications, features, warranty, and contents..."
              className="w-full p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
        </div>

        {/* Section 2: Media & Image Upload */}
        <div className="pt-4 border-t border-[var(--border)] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Product Image
            </h2>
            <div className="flex rounded-lg border border-[var(--border)] p-0.5 bg-[var(--surface-muted)]">
              <button
                type="button"
                onClick={() => setImageMode("file")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  imageMode === "file"
                    ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setImageMode("url")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  imageMode === "url"
                    ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                Image URL
              </button>
            </div>
          </div>

          {/* Mode 1: File Upload */}
          {imageMode === "file" && (
            <div>
              {filePreview ? (
                <div className="relative group rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/50 p-4 flex items-center gap-4">
                  <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-[var(--border)] bg-white shrink-0 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                      {selectedFile?.name}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {selectedFile ? `${Math.round(selectedFile.size / 1024)} KB` : ""}
                    </p>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                      Ready to upload
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearImage}
                    className="h-8 w-8 p-0 text-[var(--text-muted)] hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] rounded-2xl p-6 sm:p-8 cursor-pointer transition-colors bg-[var(--surface-subtle)]/50">
                  <div className="h-12 w-12 rounded-full bg-[var(--surface-muted)] flex items-center justify-center text-[var(--primary)] mb-3">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
                    Click to browse or drag and drop image
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">
                    PNG, JPG, WEBP, or GIF up to 5MB
                  </p>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          )}

          {/* Mode 2: Direct Image URL */}
          {imageMode === "url" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or hosted image URL"
                  className="text-xs"
                />
              </div>
              {imageUrl && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/50 p-3 flex items-center gap-3">
                  <div className="relative h-14 w-14 rounded-lg overflow-hidden border border-[var(--border)] bg-white shrink-0 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt="URL Preview"
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] truncate flex-1 font-mono">
                    {imageUrl}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 3: Initial Variant & Inventory */}
        <div className="pt-4 border-t border-[var(--border)] space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Initial Variant & Inventory
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="sku" className="text-xs font-semibold text-[var(--text-secondary)]">
                  SKU Identifier *
                </Label>
                <button
                  type="button"
                  onClick={handleGenerateSku}
                  className="text-[10px] text-[var(--primary)] hover:underline inline-flex items-center gap-0.5"
                >
                  <Sparkles className="h-3 w-3" />
                  Auto
                </button>
              </div>
              <Input
                id="sku"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="e.g. SONY-WH1000XM5-BLK"
                className="font-mono text-xs uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="priceNaira" className="text-xs font-semibold text-[var(--text-secondary)]">
                Retail Price (₦) *
              </Label>
              <Input
                id="priceNaira"
                type="number"
                step="0.01"
                required
                value={priceNaira}
                onChange={(e) => setPriceNaira(e.target.value)}
                placeholder="e.g. 450000"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stock" className="text-xs font-semibold text-[var(--text-secondary)]">
                Initial Units In Stock *
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 flex items-center justify-end gap-3">
          <Button variant="outline" asChild disabled={loading}>
            <Link href="/admin/products">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading} className="font-semibold shadow-sm min-w-[160px]">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <span>Save & Publish Product</span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
