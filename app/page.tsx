"use client";

import { useState, useRef, useCallback } from "react";

export default function Home() {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [originalFileName, setOriginalFileName] = useState("image");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.match(/image\/(jpeg|png|webp)/)) {
      setError("仅支持 JPG、PNG、WebP 格式");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("文件大小不能超过 10MB");
      return;
    }

    setError(null);
    setResultUrl(null);
    setSliderPos(50);
    setOriginalFileName(file.name.replace(/\.[^.]+$/, ""));
    setOriginalUrl(URL.createObjectURL(file));
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/remove-bg", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error || `处理失败 (${res.status})`);
      }
      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "处理失败，请重试");
    } finally {
      setLoading(false);
    }
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const onSliderMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const container = sliderRef.current;
    if (!container) return;
    const move = (ev: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const pos = Math.min(100, Math.max(0, ((ev.clientX - rect.left) / rect.width) * 100));
      setSliderPos(pos);
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const onSliderTouchMove = (e: React.TouchEvent) => {
    const container = sliderRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const pos = Math.min(100, Math.max(0, ((e.touches[0].clientX - rect.left) / rect.width) * 100));
    setSliderPos(pos);
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `removed-bg-${originalFileName}.png`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-100 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
          <span className="text-white text-sm font-bold">BG</span>
        </div>
        <span className="font-semibold text-gray-900">BG Remover</span>
        <span className="ml-2 text-sm text-gray-400">AI-powered background removal</span>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-12">
        {/* Hero */}
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-3">
          Remove Image Background
        </h1>
        <p className="text-gray-500 text-center mb-10 max-w-md">
          Upload a photo and get a transparent PNG in seconds. No signup required.
        </p>

        {/* Upload Area */}
        {!originalUrl && (
          <div
            className={`w-full max-w-xl border-2 border-dashed rounded-2xl p-12 flex flex-col items-center gap-4 cursor-pointer transition-colors ${
              dragging ? "border-purple-500 bg-purple-50" : "border-gray-300 hover:border-purple-400 hover:bg-gray-50"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-700">Drag & drop or click to upload</p>
              <p className="text-sm text-gray-400 mt-1">JPG, PNG, WebP · Max 10MB</p>
            </div>
            <button className="mt-2 px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
              Choose Image
            </button>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFileChange} />

        {/* Error */}
        {error && (
          <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm max-w-xl w-full">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-10 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Removing background...</p>
          </div>
        )}

        {/* Result: Before/After Slider */}
        {originalUrl && resultUrl && (
          <div className="mt-8 w-full max-w-2xl flex flex-col items-center gap-6">
            <div
              ref={sliderRef}
              className="relative w-full rounded-2xl overflow-hidden select-none cursor-col-resize"
              style={{ aspectRatio: "4/3" }}
              onMouseDown={onSliderMouseDown}
              onTouchMove={onSliderTouchMove}
            >
              {/* Result (bottom layer, checkerboard) */}
              <div className="absolute inset-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Crect width='10' height='10' fill='%23e5e7eb'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23e5e7eb'/%3E%3Crect x='10' y='0' width='10' height='10' fill='%23f9fafb'/%3E%3Crect x='0' y='10' width='10' height='10' fill='%23f9fafb'/%3E%3C/svg%3E\")" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resultUrl} alt="Result" className="w-full h-full object-contain" />
              </div>
              {/* Original (top layer, clipped) */}
              <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={originalUrl} alt="Original" className="w-full h-full object-contain" style={{ width: `${10000 / sliderPos}%`, maxWidth: "none" }} />
              </div>
              {/* Divider */}
              <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: `${sliderPos}%` }}>
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
                  </svg>
                </div>
              </div>
              {/* Labels */}
              <span className="absolute top-3 left-3 text-xs bg-black/50 text-white px-2 py-1 rounded">Original</span>
              <span className="absolute top-3 right-3 text-xs bg-black/50 text-white px-2 py-1 rounded">Removed</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={download}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PNG
              </button>
              <button
                onClick={() => { setOriginalUrl(null); setResultUrl(null); setError(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Try Another
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-4 text-center text-sm text-gray-400">
        <span>Free · No signup · Images are processed in memory and never stored · </span>
        <a href="/privacy" className="underline hover:text-gray-600">Privacy Policy</a>
      </footer>
    </div>
  );
}
