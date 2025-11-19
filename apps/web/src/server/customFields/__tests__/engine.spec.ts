import { describe, it, expect } from "vitest";
import { validateValue, normalizeValue, applyDefaults, filterableFields } from "../engine";
import type { CustomFieldDefinition } from "../types";

describe("Custom Fields Engine", () => {
  describe("validateValue", () => {
    it("validates required text field", () => {
      const def: CustomFieldDefinition = {
        id: "test",
        entityType: "test.entity",
        name: "test_field",
        label: "Test Field",
        type: "text",
        required: true,
      };

      expect(validateValue(def, "").valid).toBe(false);
      expect(validateValue(def, null).valid).toBe(false);
      expect(validateValue(def, "value").valid).toBe(true);
    });

    it("validates number field", () => {
      const def: CustomFieldDefinition = {
        id: "test",
        entityType: "test.entity",
        name: "test_field",
        label: "Test Field",
        type: "number",
      };

      expect(validateValue(def, 123).valid).toBe(true);
      expect(validateValue(def, "123").valid).toBe(true);
      expect(validateValue(def, "abc").valid).toBe(false);
    });

    it("validates date field", () => {
      const def: CustomFieldDefinition = {
        id: "test",
        entityType: "test.entity",
        name: "test_field",
        label: "Test Field",
        type: "date",
      };

      expect(validateValue(def, new Date()).valid).toBe(true);
      expect(validateValue(def, "2025-01-18").valid).toBe(true);
      expect(validateValue(def, "invalid").valid).toBe(false);
    });

    it("validates boolean field", () => {
      const def: CustomFieldDefinition = {
        id: "test",
        entityType: "test.entity",
        name: "test_field",
        label: "Test Field",
        type: "boolean",
      };

      expect(validateValue(def, true).valid).toBe(true);
      expect(validateValue(def, false).valid).toBe(true);
      expect(validateValue(def, "true").valid).toBe(true);
      expect(validateValue(def, 1).valid).toBe(true);
      expect(validateValue(def, "invalid").valid).toBe(false);
    });

    it("validates picklist field", () => {
      const def: CustomFieldDefinition = {
        id: "test",
        entityType: "test.entity",
        name: "test_field",
        label: "Test Field",
        type: "picklist",
        options: ["Option1", "Option2"],
      };

      expect(validateValue(def, "Option1").valid).toBe(true);
      expect(validateValue(def, "Invalid").valid).toBe(false);
    });

    it("validates multi-select field", () => {
      const def: CustomFieldDefinition = {
        id: "test",
        entityType: "test.entity",
        name: "test_field",
        label: "Test Field",
        type: "multi-select",
        options: ["Option1", "Option2"],
      };

      expect(validateValue(def, ["Option1"]).valid).toBe(true);
      expect(validateValue(def, ["Option1", "Option2"]).valid).toBe(true);
      expect(validateValue(def, ["Invalid"]).valid).toBe(false);
    });
  });

  describe("normalizeValue", () => {
    it("normalizes text value", () => {
      const def: CustomFieldDefinition = {
        id: "test",
        entityType: "test.entity",
        name: "test_field",
        label: "Test Field",
        type: "text",
      };

      expect(normalizeValue(def, 123)).toBe("123");
      expect(normalizeValue(def, null)).toBe(null);
    });

    it("normalizes number value", () => {
      const def: CustomFieldDefinition = {
        id: "test",
        entityType: "test.entity",
        name: "test_field",
        label: "Test Field",
        type: "number",
      };

      expect(normalizeValue(def, "123")).toBe(123);
      expect(normalizeValue(def, 123)).toBe(123);
    });

    it("normalizes boolean value", () => {
      const def: CustomFieldDefinition = {
        id: "test",
        entityType: "test.entity",
        name: "test_field",
        label: "Test Field",
        type: "boolean",
      };

      expect(normalizeValue(def, "true")).toBe(true);
      expect(normalizeValue(def, 1)).toBe(true);
      expect(normalizeValue(def, "false")).toBe(false);
    });

    it("applies default value", () => {
      const def: CustomFieldDefinition = {
        id: "test",
        entityType: "test.entity",
        name: "test_field",
        label: "Test Field",
        type: "text",
        defaultValue: "default",
      };

      expect(normalizeValue(def, null)).toBe("default");
    });
  });

  describe("applyDefaults", () => {
    it("applies default values", () => {
      const defs: CustomFieldDefinition[] = [
        {
          id: "field1",
          entityType: "test.entity",
          name: "field1",
          label: "Field 1",
          type: "text",
          defaultValue: "default1",
        },
        {
          id: "field2",
          entityType: "test.entity",
          name: "field2",
          label: "Field 2",
          type: "number",
          defaultValue: 42,
        },
      ];

      const defaults = applyDefaults(defs);
      expect(defaults.field1).toBe("default1");
      expect(defaults.field2).toBe(42);
    });
  });

  describe("filterableFields", () => {
    it("returns only filterable fields", () => {
      const defs: CustomFieldDefinition[] = [
        {
          id: "field1",
          entityType: "test.entity",
          name: "field1",
          label: "Field 1",
          type: "text",
          visibility: ["filter"],
        },
        {
          id: "field2",
          entityType: "test.entity",
          name: "field2",
          label: "Field 2",
          type: "reference",
          visibility: ["filter"],
        },
        {
          id: "field3",
          entityType: "test.entity",
          name: "field3",
          label: "Field 3",
          type: "text",
          visibility: ["detail"],
        },
      ];

      const filterable = filterableFields(defs);
      expect(filterable.length).toBe(1);
      expect(filterable[0].id).toBe("field1");
    });
  });
});

