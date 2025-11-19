"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import type { CustomFieldDefinition } from "@/server/customFields/types";

interface CustomFieldsPanelProps {
  entityType: string;
  entityId: string;
  mode?: "view" | "edit";
}

export function CustomFieldsPanel({ entityType, entityId, mode = "view" }: CustomFieldsPanelProps) {
  const [definitions, setDefinitions] = useState<CustomFieldDefinition[]>([]);
  const [values, setValues] = useState<Record<string, any>>({});
  const [editingValues, setEditingValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const [isEditMode, setIsEditMode] = useState(mode === "edit");

  useEffect(() => {
    loadData();
  }, [entityType, entityId]);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      // Load definitions
      const defRes = await fetch(`/api/custom-fields/definitions/list?entityType=${encodeURIComponent(entityType)}`);
      const defData = await defRes.json();

      if (!defData.ok || !defData.supported) {
        setSupported(false);
        setError(defData.reason || "Custom fields not supported for this entity type");
        setLoading(false);
        return;
      }

      setDefinitions(defData.definitions || []);

      // Load values
      const valRes = await fetch(
        `/api/custom-fields/values/get?entityType=${encodeURIComponent(entityType)}&entityId=${encodeURIComponent(entityId)}`
      );
      const valData = await valRes.json();

      if (valData.ok && valData.supported) {
        setValues(valData.values || {});
        setEditingValues(valData.values || {});
      } else if (!valData.supported) {
        setSupported(false);
        setError(valData.reason || "Custom field values not supported for this entity type");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load custom fields");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/custom-fields/values/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          entityId,
          values: editingValues,
        }),
      });

      const data = await res.json();

      if (!data.ok || !data.supported) {
        setError(data.error || data.reason || "Failed to save custom fields");
        return;
      }

      setValues(data.values || {});
      setIsEditMode(false);
    } catch (err: any) {
      setError(err?.message || "Failed to save custom fields");
    } finally {
      setSaving(false);
    }
  }

  function handleValueChange(fieldId: string, value: any) {
    setEditingValues((prev) => ({ ...prev, [fieldId]: value }));
  }

  if (loading) {
    return (
      <Card>
        <CardHeader title="Custom Fields" />
        <CardContent>
          <div className="text-sm" style={{ color: "#6b7280" }}>
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!supported || definitions.length === 0) {
    return (
      <Card>
        <CardHeader title="Custom Fields" />
        <CardContent>
          {error ? (
            <Alert variant="warning" title="Not Available">
              {error}
            </Alert>
          ) : (
            <div className="text-sm" style={{ color: "#6b7280" }}>
              No custom fields defined for this entity type.
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Custom Fields"
        actions={
          mode === "edit" && !isEditMode ? (
            <Button variant="secondary" size="sm" onClick={() => setIsEditMode(true)}>
              Edit
            </Button>
          ) : isEditMode ? (
            <div className="flex gap-2">
              <Button variant="subtle" size="sm" onClick={() => { setIsEditMode(false); setEditingValues(values); }}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          ) : null
        }
      />
      <CardContent>
        {error && (
          <Alert variant="danger" title="Error" className="mb-4">
            {error}
          </Alert>
        )}

        <div className="space-y-4">
          {definitions.map((def) => {
            const currentValue = isEditMode ? editingValues[def.id] : values[def.id];
            const displayValue = currentValue ?? def.defaultValue ?? null;

            return (
              <div key={def.id} className="space-y-1">
                <label className="text-sm font-medium" style={{ color: "#374151" }}>
                  {def.label}
                  {def.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {def.helpText && (
                  <div className="text-xs" style={{ color: "#6b7280" }}>
                    {def.helpText}
                  </div>
                )}

                {isEditMode ? (
                  <FieldEditor definition={def} value={displayValue} onChange={(v) => handleValueChange(def.id, v)} />
                ) : (
                  <FieldDisplay definition={def} value={displayValue} />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function FieldEditor({
  definition,
  value,
  onChange,
}: {
  definition: CustomFieldDefinition;
  value: any;
  onChange: (value: any) => void;
}) {
  switch (definition.type) {
    case "text":
      return (
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={definition.helpText}
        />
      );

    case "number":
      return (
        <Input
          type="number"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : null)}
          placeholder={definition.helpText}
        />
      );

    case "date":
      return (
        <Input
          type="date"
          value={value ? (value instanceof Date ? value.toISOString().split("T")[0] : value.split("T")[0]) : ""}
          onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
        />
      );

    case "boolean":
      return (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value === true || value === "true" || value === 1}
            onChange={(e) => onChange(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">{value ? "Yes" : "No"}</span>
        </div>
      );

    case "picklist":
      return (
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value || null)}
          className="w-full px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: "#d1d5db", background: "#fff" }}
        >
          <option value="">-- Select --</option>
          {definition.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );

    case "multi-select":
      return (
        <div className="space-y-2">
          {definition.options?.map((opt) => (
            <div key={opt} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={Array.isArray(value) && value.includes(opt)}
                onChange={(e) => {
                  const current = Array.isArray(value) ? value : [];
                  if (e.target.checked) {
                    onChange([...current, opt]);
                  } else {
                    onChange(current.filter((v) => v !== opt));
                  }
                }}
                className="rounded"
              />
              <span className="text-sm">{opt}</span>
            </div>
          ))}
        </div>
      );

    case "reference":
      return (
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Reference ID"
        />
      );

    default:
      return <div className="text-sm text-gray-500">Unknown field type</div>;
  }
}

function FieldDisplay({ definition, value }: { definition: CustomFieldDefinition; value: any }) {
  if (value === null || value === undefined || value === "") {
    return <div className="text-sm" style={{ color: "#9ca3af" }}>—</div>;
  }

  switch (definition.type) {
    case "boolean":
      return <Badge variant={value ? "success" : "default"}>{value ? "Yes" : "No"}</Badge>;

    case "picklist":
      return <Badge variant="info">{String(value)}</Badge>;

    case "multi-select":
      return (
        <div className="flex flex-wrap gap-1">
          {Array.isArray(value) ? (
            value.map((v, i) => <Badge key={i} variant="info">{String(v)}</Badge>)
          ) : (
            <Badge variant="info">{String(value)}</Badge>
          )}
        </div>
      );

    case "date":
      return <div className="text-sm">{new Date(value).toLocaleDateString()}</div>;

    case "number":
      return <div className="text-sm">{Number(value).toLocaleString()}</div>;

    default:
      return <div className="text-sm">{String(value)}</div>;
  }
}

