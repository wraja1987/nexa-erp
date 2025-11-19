import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "../Button";
import { Input } from "../Input";
import { Badge } from "../Badge";
import { Alert } from "../Alert";
import { Card, CardHeader, CardContent } from "../Card";
import { PageHeader } from "../PageHeader";
import { DataTable, type Column } from "../../table/DataTable";

describe("UI Components — Phase 22", () => {
  describe("Button", () => {
    it("should render primary button", () => {
      render(<Button variant="primary">Click me</Button>);
      const button = screen.getByRole("button", { name: /click me/i });
      expect(button).toBeTruthy();
    });

    it("should render disabled button", () => {
      render(<Button variant="primary" disabled>Disabled</Button>);
      const button = screen.getByRole("button", { name: /disabled/i });
      expect(button).toBeDisabled();
    });

    it("should render loading button", () => {
      render(<Button variant="primary" isLoading>Loading</Button>);
      expect(screen.getByText(/loading/i)).toBeTruthy();
    });
  });

  describe("Input", () => {
    it("should render input with label", () => {
      render(<Input label="Email" placeholder="Enter email" />);
      expect(screen.getByLabelText(/email/i)).toBeTruthy();
    });

    it("should show error message", () => {
      render(<Input label="Email" error="Invalid email" />);
      expect(screen.getByText(/invalid email/i)).toBeTruthy();
    });
  });

  describe("Badge", () => {
    it("should render success badge", () => {
      render(<Badge variant="success">Active</Badge>);
      expect(screen.getByText(/active/i)).toBeTruthy();
    });
  });

  describe("Alert", () => {
    it("should render error alert", () => {
      render(<Alert variant="error" title="Error">Something went wrong</Alert>);
      expect(screen.getByRole("alert")).toBeTruthy();
      expect(screen.getByText(/error/i)).toBeTruthy();
      expect(screen.getByText(/something went wrong/i)).toBeTruthy();
    });
  });

  describe("Card", () => {
    it("should render card with header and content", () => {
      render(
        <Card>
          <CardHeader title="Test Card" />
          <CardContent>Card content</CardContent>
        </Card>
      );
      expect(screen.getByText(/test card/i)).toBeTruthy();
      expect(screen.getByText(/card content/i)).toBeTruthy();
    });
  });

  describe("PageHeader", () => {
    it("should render page header with title and breadcrumb", () => {
      render(
        <PageHeader
          title="Test Page"
          breadcrumb={[
            { label: "Home", href: "/" },
            { label: "Test" },
          ]}
        />
      );
      expect(screen.getByText(/test page/i)).toBeTruthy();
      expect(screen.getByText(/home/i)).toBeTruthy();
    });
  });

  describe("DataTable", () => {
    it("should render data table with columns and data", () => {
      const columns: Column<{ id: string; name: string }>[] = [
        { key: "name", header: "Name", sortable: true },
      ];
      const data = [{ id: "1", name: "Test Item" }];

      render(<DataTable columns={columns} data={data} />);
      expect(screen.getByText(/name/i)).toBeTruthy();
      expect(screen.getByText(/test item/i)).toBeTruthy();
    });

    it("should show empty message when no data", () => {
      const columns: Column<{ id: string; name: string }>[] = [
        { key: "name", header: "Name" },
      ];

      render(<DataTable columns={columns} data={[]} emptyMessage="No data" />);
      expect(screen.getByText(/no data/i)).toBeTruthy();
    });
  });
});

