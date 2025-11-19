import { describe, it, expect } from "vitest";
import * as accounts from "@/server/crm/accounts";
import * as contacts from "@/server/crm/contacts";
import * as activities from "@/server/crm/activities";
import * as pipelines from "@/server/crm/pipelines";

describe("CRM scaffolding", () => {
  it("accounts exports exist", () => {
    expect(typeof accounts.listAccounts).toBe("function");
    expect(typeof accounts.getAccount).toBe("function");
  });
  it("contacts exports exist", () => {
    expect(typeof contacts.listContacts).toBe("function");
    expect(typeof contacts.getContact).toBe("function");
  });
  it("activities exports exist", () => {
    expect(typeof activities.listActivities).toBe("function");
  });
  it("pipelines/opportunities exports exist", () => {
    expect(typeof pipelines.listPipelines).toBe("function");
    expect(typeof pipelines.listOpportunities).toBe("function");
  });
});


