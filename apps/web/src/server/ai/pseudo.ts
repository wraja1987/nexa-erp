function mask(value: any, prefix: string): string {
  const id = typeof value === "string" && value.length > 0 ? value : Math.random().toString(36).slice(2, 8);
  return `${prefix}_${id.slice(0, 6).toUpperCase()}`;
}

export function stripPiiFromCustomer(data: any): any {
  if (!data || typeof data !== "object") return data;
  const clone = { ...data };
  delete clone.email;
  delete clone.phone;
  delete clone.address;
  delete clone.notes;
  if (clone.name) clone.name = mask(clone.name, "CUST");
  if (clone.id) clone.id = mask(clone.id, "CUST");
  return clone;
}

export function stripPiiFromVendor(data: any): any {
  if (!data || typeof data !== "object") return data;
  const clone = { ...data };
  delete clone.email;
  delete clone.phone;
  delete clone.address;
  delete clone.notes;
  if (clone.name) clone.name = mask(clone.name, "VEND");
  if (clone.id) clone.id = mask(clone.id, "VEND");
  return clone;
}

export function stripPiiFromEmployee(data: any): any {
  if (!data || typeof data !== "object") return data;
  const clone = { ...data };
  delete clone.email;
  delete clone.phone;
  delete clone.address;
  delete clone.notes;
  if (clone.firstName) clone.firstName = mask(clone.firstName, "EMP");
  if (clone.lastName) clone.lastName = mask(clone.lastName, "EMP");
  if (clone.id) clone.id = mask(clone.id, "EMP");
  return clone;
}

export function stripPiiFromGenericRecord(data: any): any {
  if (!data || typeof data !== "object") return data;
  const clone: any = Array.isArray(data) ? data.map((d) => stripPiiFromGenericRecord(d)) : { ...data };
  if (Array.isArray(clone)) return clone;
  for (const k of Object.keys(clone)) {
    const lk = k.toLowerCase();
    if (["email", "phone", "address", "notes"].includes(lk)) {
      delete clone[k];
      continue;
    }
    if (lk === "name" || lk.endsWith("name")) {
      clone[k] = mask(clone[k], "REC");
      continue;
    }
    const v = clone[k];
    if (v && typeof v === "object") clone[k] = stripPiiFromGenericRecord(v);
  }
  return clone;
}


