"use client";

import { useEffect, useState } from "react";

export type AttachmentPanelProps = {
  entityType: string;
  entityId: string;
  title?: string;
};

type Attachment = {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  version: number;
  createdAt: string;
  createdBy: string;
};

export default function AttachmentPanel({ entityType, entityId, title = "Attachments" }: AttachmentPanelProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadAttachments();
  }, [entityType, entityId]);

  async function loadAttachments() {
    try {
      setLoading(true);
      const res = await fetch(`/api/attachments/list?entityType=${encodeURIComponent(entityType)}&entityId=${encodeURIComponent(entityId)}`);
      const data = await res.json();

      if (!data.ok) {
        if (res.status === 501) {
          setSupported(false);
          setError(data.error || "Attachments not supported");
        } else {
          setError(data.error || "Failed to load attachments");
        }
        return;
      }

      if (data.data.supported === false) {
        setSupported(false);
        setError(data.data.message || "Attachments not supported on this environment");
        return;
      }

      setAttachments(data.data.attachments || []);
      setSupported(true);
    } catch (e: any) {
      setError(e?.message || "Failed to load attachments");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(attachmentId: string) {
    if (!confirm("Delete this attachment?")) return;

    try {
      const res = await fetch("/api/attachments/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attachmentId }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete attachment");
        return;
      }

      await loadAttachments();
    } catch (e: any) {
      alert(e?.message || "Failed to delete attachment");
    }
  }

  async function handleUpload() {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        setUploading(true);

        // Get upload URL
        const uploadRes = await fetch("/api/attachments/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entityType,
            entityId,
            filename: file.name,
            mimeType: file.type,
            size: file.size,
          }),
        });

        if (!uploadRes.ok) {
          const data = await uploadRes.json();
          alert(data.error || "Failed to get upload URL");
          return;
        }

        const uploadData = await uploadRes.json();
        if (!uploadData.data.supported) {
          alert(uploadData.data.message || "Upload not supported");
          return;
        }

        // Upload to S3
        const s3Res = await fetch(uploadData.data.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
            "Content-Length": file.size.toString(),
          },
          body: file,
        });

        if (!s3Res.ok) {
          alert("Failed to upload file to S3");
          return;
        }

        // Complete upload (create DB record)
        const completeRes = await fetch("/api/attachments/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entityType,
            entityId,
            storageKey: uploadData.data.storageKey,
            filename: file.name,
            mimeType: file.type,
            size: file.size,
          }),
        });

        if (!completeRes.ok) {
          const data = await completeRes.json();
          alert(data.error || "Failed to complete upload");
          return;
        }

        await loadAttachments();
      } catch (e: any) {
        alert(e?.message || "Failed to upload file");
      } finally {
        setUploading(false);
      }
    };
    input.click();
  }

  async function handleDownload(attachmentId: string) {
    try {
      const res = await fetch("/api/attachments/download-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attachmentId }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to get download URL");
        return;
      }

      const data = await res.json();
      if (!data.data.supported) {
        alert(data.data.message || "Download not supported");
        return;
      }

      // Open download URL
      window.open(data.data.downloadUrl, "_blank");
    } catch (e: any) {
      alert(e?.message || "Failed to download file");
    }
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (!supported) {
    return (
      <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
        <h3 className="text-sm font-medium mb-2">{title}</h3>
        <div className="text-sm" style={{ color: "var(--color-muted)" }}>
          {error || "Attachments not supported on this environment/schema"}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white p-6 space-y-4" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Add Attachment"}
        </button>
      </div>

      {loading ? (
        <div className="text-sm" style={{ color: "var(--color-muted)" }}>Loading...</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : attachments.length === 0 ? (
        <div className="text-sm" style={{ color: "var(--color-muted)" }}>No attachments</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2">Filename</th>
                <th className="text-left p-2">Size</th>
                <th className="text-left p-2">Version</th>
                <th className="text-left p-2">Created</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {attachments.map((att) => (
                <tr key={att.id}>
                  <td className="p-2">{att.filename}</td>
                  <td className="p-2">{formatSize(att.size)}</td>
                  <td className="p-2">v{att.version}</td>
                  <td className="p-2">{new Date(att.createdAt).toLocaleString()}</td>
                  <td className="p-2">
                    <button
                      onClick={() => handleDownload(att.id)}
                      className="text-purple-600 hover:underline mr-3"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(att.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

