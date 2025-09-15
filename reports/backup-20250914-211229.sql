--
-- PostgreSQL database dump
--

-- Dumped from database version 14.17 (Homebrew)
-- Dumped by pg_dump version 14.17 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AsnStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AsnStatus" AS ENUM (
    'created',
    'received',
    'closed'
);


--
-- Name: PayrollRunStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PayrollRunStatus" AS ENUM (
    'draft',
    'calculated',
    'posted'
);


--
-- Name: PickStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PickStatus" AS ENUM (
    'queued',
    'picked',
    'short',
    'cancelled'
);


--
-- Name: PoStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PoStatus" AS ENUM (
    'draft',
    'approved',
    'sent',
    'received',
    'closed',
    'cancelled'
);


--
-- Name: PosPaymentMethod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PosPaymentMethod" AS ENUM (
    'card',
    'cash'
);


--
-- Name: PosSaleStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PosSaleStatus" AS ENUM (
    'open',
    'paid',
    'refunded',
    'void'
);


--
-- Name: QualityStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."QualityStatus" AS ENUM (
    'open',
    'accepted',
    'rejected',
    'released',
    'in_progress',
    'completed'
);


--
-- Name: TaskStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TaskStatus" AS ENUM (
    'pending',
    'in_progress',
    'done',
    'blocked'
);


--
-- Name: TillShiftStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TillShiftStatus" AS ENUM (
    'open',
    'closed'
);


--
-- Name: WaveStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."WaveStatus" AS ENUM (
    'planned',
    'released',
    'dispatched'
);


--
-- Name: WebhookSource; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."WebhookSource" AS ENUM (
    'stripe',
    'open_banking',
    'hmrc'
);


--
-- Name: WorkOrderStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."WorkOrderStatus" AS ENUM (
    'planned',
    'released',
    'completed',
    'cancelled'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Allowance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Allowance" (
    id text NOT NULL,
    "payslipId" text NOT NULL,
    name text NOT NULL,
    amount numeric(65,30) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ApiKey; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ApiKey" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    label text NOT NULL,
    status text NOT NULL,
    "lastUsedAt" timestamp(3) without time zone,
    "rateLimitPerMin" integer NOT NULL,
    burst integer NOT NULL,
    "ipAllowlist" jsonb NOT NULL,
    "secretHash" text NOT NULL
);


--
-- Name: Asn; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Asn" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    number text NOT NULL,
    "supplierRef" text,
    status public."AsnStatus" DEFAULT 'created'::public."AsnStatus" NOT NULL,
    eta timestamp(3) without time zone,
    "receivedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "actorId" text NOT NULL,
    action text NOT NULL,
    target text NOT NULL,
    at timestamp(3) without time zone NOT NULL,
    data jsonb NOT NULL
);


--
-- Name: BackupJob; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BackupJob" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "ranAt" timestamp(3) without time zone NOT NULL,
    ok boolean NOT NULL,
    summary text NOT NULL
);


--
-- Name: BankAccount; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BankAccount" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    currency text DEFAULT 'GBP'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: BankConnection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BankConnection" (
    id text NOT NULL,
    provider text DEFAULT 'truelayer'::text NOT NULL,
    status text NOT NULL,
    "institutionId" text,
    "consentId" text,
    "userId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: BankReconciliation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BankReconciliation" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "bankAccountId" text NOT NULL,
    "fromDate" timestamp(3) without time zone NOT NULL,
    "toDate" timestamp(3) without time zone NOT NULL,
    "statementBal" numeric(65,30) NOT NULL,
    "reconciledAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: BankStatementLine; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BankStatementLine" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "bankAccountId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    description text NOT NULL,
    amount numeric(65,30) NOT NULL,
    reference text,
    reconciled boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: BillingPlan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BillingPlan" (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    currency text NOT NULL,
    "unitPriceMinor" integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: BomItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BomItem" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "parentItemCode" text NOT NULL,
    "componentItemCode" text NOT NULL,
    quantity numeric(65,30) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Capa; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Capa" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    title text NOT NULL,
    "rootCause" text,
    actions jsonb,
    "ownerId" text,
    status public."QualityStatus" DEFAULT 'open'::public."QualityStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: CapacityCalendar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CapacityCalendar" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "resourceCode" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "availableMins" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Channel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Channel" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    provider text NOT NULL,
    name text NOT NULL,
    config jsonb NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: CoaTemplate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CoaTemplate" (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: CoaTemplateLine; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CoaTemplateLine" (
    id text NOT NULL,
    "templateId" text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    type text NOT NULL
);


--
-- Name: ConsolidationMap; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ConsolidationMap" (
    id text NOT NULL,
    "groupCode" text NOT NULL,
    "entityId" text NOT NULL,
    account text NOT NULL,
    "mapTo" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: CurrencyRate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CurrencyRate" (
    id text NOT NULL,
    "fromCode" text NOT NULL,
    "toCode" text NOT NULL,
    rate numeric(65,30) NOT NULL,
    "asOfDate" timestamp(3) without time zone NOT NULL
);


--
-- Name: CustomerInvoice; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CustomerInvoice" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    number text NOT NULL,
    "customerId" text NOT NULL,
    currency text DEFAULT 'GBP'::text NOT NULL,
    total numeric(65,30) DEFAULT 0 NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    "issuedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dueAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: CustomerPayment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CustomerPayment" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "invoiceId" text NOT NULL,
    amount numeric(65,30) NOT NULL,
    "paidAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    method text NOT NULL,
    reference text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Deduction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Deduction" (
    id text NOT NULL,
    "payslipId" text NOT NULL,
    name text NOT NULL,
    amount numeric(65,30) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: DemoDataVisibility; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DemoDataVisibility" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "adminUserId" text NOT NULL,
    "visibleUntil" timestamp(3) without time zone NOT NULL,
    "maskLevel" integer NOT NULL
);


--
-- Name: DepreciationSchedule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DepreciationSchedule" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "assetId" text NOT NULL,
    period timestamp(3) without time zone NOT NULL,
    amount numeric(65,30) NOT NULL,
    posted boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: DrDrill; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DrDrill" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "ranAt" timestamp(3) without time zone NOT NULL,
    ok boolean NOT NULL,
    "restoredCounts" jsonb NOT NULL,
    notes text
);


--
-- Name: EdiMessage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EdiMessage" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    direction text NOT NULL,
    type text NOT NULL,
    payload jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Employee; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Employee" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "empNo" text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Entity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Entity" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    name text NOT NULL,
    "currencyCode" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: EntityExt; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EntityExt" (
    id text NOT NULL,
    "entityId" text NOT NULL,
    "vatNumber" text,
    eori text,
    meta jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: FixedAsset; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."FixedAsset" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "assetCode" text NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    cost numeric(65,30) NOT NULL,
    salvage numeric(65,30) DEFAULT 0 NOT NULL,
    "usefulLifeM" integer NOT NULL,
    "acquiredAt" timestamp(3) without time zone NOT NULL,
    "disposedAt" timestamp(3) without time zone,
    "disposalProceeds" numeric(65,30),
    "disposalNotes" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: FixedAssetDisposal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."FixedAssetDisposal" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "assetId" text NOT NULL,
    "disposedAt" timestamp(3) without time zone NOT NULL,
    proceeds numeric(65,30) DEFAULT 0 NOT NULL,
    "gainLoss" numeric(65,30) DEFAULT 0 NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: HubspotCompany; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."HubspotCompany" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "hsId" text NOT NULL,
    name text,
    domain text,
    "lastSyncAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: HubspotContact; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."HubspotContact" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "hsId" text NOT NULL,
    email text,
    "firstName" text,
    "lastName" text,
    phone text,
    "lastSyncAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: HubspotDeal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."HubspotDeal" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "hsId" text NOT NULL,
    name text,
    amount numeric(65,30),
    stage text,
    "closeDate" timestamp(3) without time zone,
    "lastSyncAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: IndustryInsight; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."IndustryInsight" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    sector text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: IndustryWidget; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."IndustryWidget" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    sector text NOT NULL,
    code text NOT NULL,
    config jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: IntercompanyTxn; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."IntercompanyTxn" (
    id text NOT NULL,
    "fromEntityId" text NOT NULL,
    "toEntityId" text NOT NULL,
    ref text NOT NULL,
    amount numeric(65,30) NOT NULL,
    currency text DEFAULT 'GBP'::text NOT NULL,
    "postedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: InventoryItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."InventoryItem" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    sku text NOT NULL,
    "qtyOnHand" numeric(65,30) DEFAULT 0 NOT NULL,
    "warehouseId" text,
    "locationId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: InventoryLot; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."InventoryLot" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    sku text NOT NULL,
    qty numeric(65,30) DEFAULT 0 NOT NULL,
    "unitCost" numeric(65,30) DEFAULT 0 NOT NULL,
    "receivedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "warehouseId" text,
    "locationId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Invoice; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Invoice" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    number text NOT NULL,
    "pdfHash" text NOT NULL,
    total numeric(65,30) NOT NULL,
    "currencyCode" text NOT NULL,
    "issuedAt" timestamp(3) without time zone NOT NULL,
    "dueAt" timestamp(3) without time zone NOT NULL,
    status text NOT NULL
);


--
-- Name: JournalEntry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."JournalEntry" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "docRef" text,
    memo text,
    "postedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: JournalLine; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."JournalLine" (
    id text NOT NULL,
    "entryId" text NOT NULL,
    "accountId" text NOT NULL,
    debit numeric(65,30) DEFAULT 0 NOT NULL,
    credit numeric(65,30) DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: KpiSnapshot; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."KpiSnapshot" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    name text NOT NULL,
    value numeric(65,30) NOT NULL,
    "asOf" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Ledger; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Ledger" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "entryNo" integer DEFAULT 0 NOT NULL,
    account text NOT NULL,
    debit numeric(65,30) DEFAULT 0 NOT NULL,
    credit numeric(65,30) DEFAULT 0 NOT NULL,
    "docRef" text,
    "postedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Listing; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Listing" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "channelId" text NOT NULL,
    sku text NOT NULL,
    title text NOT NULL,
    price numeric(65,30) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Location; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Location" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "warehouseId" text NOT NULL,
    code text NOT NULL,
    type text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: MrpPlan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MrpPlan" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "itemCode" text NOT NULL,
    "planDate" timestamp(3) without time zone NOT NULL,
    "suggestedQty" numeric(65,30) NOT NULL,
    recommendation text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    type text NOT NULL,
    body text NOT NULL,
    "readAt" timestamp(3) without time zone
);


--
-- Name: NotificationJob; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."NotificationJob" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "templateId" text NOT NULL,
    "to" text NOT NULL,
    channel text NOT NULL,
    status text DEFAULT 'queued'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: NotificationTemplate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."NotificationTemplate" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    subject text,
    body text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: OrderExternal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OrderExternal" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "channelId" text NOT NULL,
    "extId" text NOT NULL,
    status text NOT NULL,
    total numeric(65,30) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: PaySchedule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PaySchedule" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    name text NOT NULL,
    frequency text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: PayrollRun; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PayrollRun" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "scheduleId" text NOT NULL,
    "periodStart" timestamp(3) without time zone NOT NULL,
    "periodEnd" timestamp(3) without time zone NOT NULL,
    status public."PayrollRunStatus" DEFAULT 'draft'::public."PayrollRunStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Payslip; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Payslip" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "runId" text NOT NULL,
    "employeeId" text NOT NULL,
    "grossPay" numeric(65,30) DEFAULT 0 NOT NULL,
    "netPay" numeric(65,30) DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: PeriodClose; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PeriodClose" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "periodStart" timestamp(3) without time zone NOT NULL,
    "periodEnd" timestamp(3) without time zone NOT NULL,
    "closedBy" text NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: PickTask; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PickTask" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "waveId" text,
    sku text NOT NULL,
    qty numeric(65,30) NOT NULL,
    "fromLocId" text,
    "toLocId" text,
    status public."PickStatus" DEFAULT 'queued'::public."PickStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Plan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Plan" (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    tier text NOT NULL,
    active boolean DEFAULT true NOT NULL
);


--
-- Name: PlanAddon; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PlanAddon" (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    active boolean DEFAULT true NOT NULL
);


--
-- Name: PoLine; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PoLine" (
    id text NOT NULL,
    "poId" text NOT NULL,
    "lineNo" integer NOT NULL,
    sku text NOT NULL,
    qty numeric(65,30) NOT NULL,
    price numeric(65,30) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: PosEvent; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PosEvent" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "saleId" text,
    "shiftId" text,
    type text NOT NULL,
    payload jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: PosLine; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PosLine" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "saleId" text NOT NULL,
    sku text NOT NULL,
    name text NOT NULL,
    qty numeric(65,30) NOT NULL,
    "unitPrice" numeric(65,30) NOT NULL,
    "taxRate" numeric(65,30) DEFAULT 0 NOT NULL,
    "lineTotal" numeric(65,30) NOT NULL,
    "inventoryItemId" text
);


--
-- Name: PosPayment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PosPayment" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "saleId" text NOT NULL,
    method public."PosPaymentMethod" NOT NULL,
    amount numeric(65,30) NOT NULL,
    tip numeric(65,30),
    "stripePaymentIntentId" text,
    "stripeChargeId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: PosRefund; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PosRefund" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "saleId" text NOT NULL,
    amount numeric(65,30) NOT NULL,
    reason text,
    "stripeRefundId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: PosSale; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PosSale" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "storeId" text NOT NULL,
    "shiftId" text,
    "cashierUserId" text NOT NULL,
    "saleNumber" text NOT NULL,
    status public."PosSaleStatus" DEFAULT 'open'::public."PosSaleStatus" NOT NULL,
    subtotal numeric(65,30) DEFAULT 0 NOT NULL,
    tax numeric(65,30) DEFAULT 0 NOT NULL,
    total numeric(65,30) DEFAULT 0 NOT NULL,
    currency text DEFAULT 'GBP'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: PurchaseOrder; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PurchaseOrder" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    number text NOT NULL,
    "supplierId" text NOT NULL,
    status public."PoStatus" DEFAULT 'draft'::public."PoStatus" NOT NULL,
    "orderDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expectedAt" timestamp(3) without time zone,
    currency text DEFAULT 'GBP'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: QualityHold; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."QualityHold" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    sku text,
    "lotId" text,
    reason text NOT NULL,
    status public."QualityStatus" DEFAULT 'open'::public."QualityStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: QualityInspection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."QualityInspection" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "docType" text NOT NULL,
    "docId" text NOT NULL,
    status public."QualityStatus" DEFAULT 'open'::public."QualityStatus" NOT NULL,
    findings jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: RoutingStep; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RoutingStep" (
    id text NOT NULL,
    "workOrderId" text,
    seq integer NOT NULL,
    "resourceCode" text,
    "durationMins" integer,
    status public."TaskStatus" DEFAULT 'pending'::public."TaskStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ShipmentExternal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ShipmentExternal" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "orderId" text NOT NULL,
    carrier text,
    tracking text,
    "shippedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SiemExportBatch; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SiemExportBatch" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "filePath" text NOT NULL,
    "recordCount" integer NOT NULL,
    sha256 text NOT NULL
);


--
-- Name: Store; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Store" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    address text,
    timezone text DEFAULT 'Europe/London'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Subscription; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Subscription" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "planId" text NOT NULL,
    status text NOT NULL,
    "currentPeriodStart" timestamp(3) without time zone NOT NULL,
    "currentPeriodEnd" timestamp(3) without time zone NOT NULL,
    "cancelAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "customerId" text,
    "trialEnd" timestamp(3) without time zone,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Supplier; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Supplier" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SupplierBill; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SupplierBill" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    number text NOT NULL,
    "supplierId" text NOT NULL,
    currency text DEFAULT 'GBP'::text NOT NULL,
    total numeric(65,30) DEFAULT 0 NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    "receivedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dueAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SupplierPayment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SupplierPayment" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "billId" text NOT NULL,
    amount numeric(65,30) NOT NULL,
    "paidAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    method text NOT NULL,
    reference text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Tenant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Tenant" (
    id text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ThirdPartyConnector; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ThirdPartyConnector" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    provider text NOT NULL,
    name text NOT NULL,
    config jsonb NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: TillShift; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TillShift" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "storeId" text NOT NULL,
    "openedByUserId" text NOT NULL,
    "closedByUserId" text,
    "openedAt" timestamp(3) without time zone NOT NULL,
    "closedAt" timestamp(3) without time zone,
    "openingFloat" numeric(65,30) DEFAULT 0 NOT NULL,
    "closingFloat" numeric(65,30),
    status public."TillShiftStatus" DEFAULT 'open'::public."TillShiftStatus" NOT NULL
);


--
-- Name: TreasuryMovement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TreasuryMovement" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    type text NOT NULL,
    amount numeric(65,30) NOT NULL,
    currency text DEFAULT 'GBP'::text NOT NULL,
    notes text,
    at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: UsageEvent; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UsageEvent" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    type text NOT NULL,
    quantity integer NOT NULL,
    at timestamp(3) without time zone NOT NULL,
    metadata jsonb NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    tenant_id text NOT NULL,
    email text NOT NULL,
    role text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "mfaEnabled" boolean DEFAULT false NOT NULL,
    "mfaSecret" text,
    "passwordHash" text
);


--
-- Name: VatReturn; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."VatReturn" (
    id text NOT NULL,
    vrn text NOT NULL,
    "periodKey" text NOT NULL,
    start timestamp(3) without time zone NOT NULL,
    "end" timestamp(3) without time zone NOT NULL,
    due timestamp(3) without time zone NOT NULL,
    status text NOT NULL,
    "totalDue" numeric(65,30),
    "submittedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Warehouse; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Warehouse" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Wave; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Wave" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    number text NOT NULL,
    status public."WaveStatus" DEFAULT 'planned'::public."WaveStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: WebhookEndpoint; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."WebhookEndpoint" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    url text NOT NULL,
    "secretHash" text NOT NULL,
    active boolean DEFAULT true NOT NULL
);


--
-- Name: WebhookEvent; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."WebhookEvent" (
    id text NOT NULL,
    "endpointId" text NOT NULL,
    "eventType" text NOT NULL,
    "deliveredAt" timestamp(3) without time zone,
    status text NOT NULL,
    payload jsonb NOT NULL,
    "eventId" text,
    "receivedAt" timestamp(3) without time zone,
    source public."WebhookSource"
);


--
-- Name: WorkOrder; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."WorkOrder" (
    id text NOT NULL,
    number text NOT NULL,
    "tenantId" text NOT NULL,
    "itemCode" text NOT NULL,
    quantity numeric(65,30) NOT NULL,
    status public."WorkOrderStatus" DEFAULT 'planned'::public."WorkOrderStatus" NOT NULL,
    "startPlanned" timestamp(3) without time zone,
    "endPlanned" timestamp(3) without time zone,
    "startActual" timestamp(3) without time zone,
    "endActual" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: tenant_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenant_keys (
    tenant_id text NOT NULL,
    enc_key bytea NOT NULL,
    alg text DEFAULT 'AES-256-GCM'::text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    rotated_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Account" (id, "tenantId", code, name, type, "createdAt", "updatedAt") FROM stdin;
cmf6kgcpw0002it62gj2j1pt4	t1	STRIPE_CLEAR	Stripe Clearing	income	2025-09-05 08:21:37.509	2025-09-05 08:21:37.509
cmf6kgcpz0003it629wxz084y	t1	SALES	Sales	income	2025-09-05 08:21:37.512	2025-09-05 08:21:37.512
cmf6kgcq00004it62g6ll773q	t1	VAT_LIABILIT	VAT Liability	income	2025-09-05 08:21:37.513	2025-09-05 08:21:37.513
cmfjel7et0002u1f7xv1jht73	cmfjel7ee0000u1f734juv4ki	1000	Cash	asset	2025-09-14 07:58:26.501	2025-09-14 07:58:26.501
\.


--
-- Data for Name: Allowance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Allowance" (id, "payslipId", name, amount, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ApiKey; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ApiKey" (id, "tenantId", label, status, "lastUsedAt", "rateLimitPerMin", burst, "ipAllowlist", "secretHash") FROM stdin;
\.


--
-- Data for Name: Asn; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Asn" (id, "tenantId", number, "supplierRef", status, eta, "receivedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AuditLog" (id, "tenantId", "actorId", action, target, at, data) FROM stdin;
cmf6k9gbb0004itosoimjmltd	t1	system	create	/api/pos/sale	2025-09-05 08:16:15.574	{"route": "/api/pos/sale", "total": 300, "action": "create", "module": "pos", "saleId": "cmf6k9gax0002itosm64lynmt", "hasMasked": true}
cmf6khqo20006itps8tvrs1bt	t1	system	pay	/api/pos/sale/pay	2025-09-05 08:22:42.24	{"route": "/api/pos/sale/pay", "action": "pay", "method": "CASH", "module": "pos", "saleId": "cmf6k9gax0002itosm64lynmt", "hasMasked": true, "paymentId": "cmf6khqnc0001itpsn4q1sfhw"}
cmf6mfca3000aitpsk77rq70n	t1	system	create	/api/pos/sale	2025-09-05 09:16:49.515	{"route": "/api/pos/sale", "total": 300, "action": "create", "module": "pos", "saleId": "cmf6mfc9v0008itpsf3u3kdpk", "hasMasked": true}
cmf6mfcbp000hitpsmn16j6ct	t1	system	pay	/api/pos/sale/pay	2025-09-05 09:16:49.573	{"route": "/api/pos/sale/pay", "action": "pay", "method": "CASH", "module": "pos", "saleId": "cmf6mfc9v0008itpsf3u3kdpk", "hasMasked": true, "paymentId": "cmf6mfcba000citpsuhdruv9k"}
cmf6mfccz000iitps4ilwu4ws	t1	system	event	/api/pos/stripe/webhook	2025-09-05 09:16:49.618	{"route": "/api/pos/stripe/webhook", "module": "pos", "status": "not_configured", "hasMasked": true}
cmf6mio7k000mitpsavrx0123	t1	system	create	/api/pos/sale	2025-09-05 09:19:24.943	{"route": "/api/pos/sale", "total": 300, "action": "create", "module": "pos", "saleId": "cmf6mio7e000kitps1rxqt1oc", "hasMasked": true}
cmf6mio8n000titps6k3667gl	t1	system	pay	/api/pos/sale/pay	2025-09-05 09:19:24.983	{"route": "/api/pos/sale/pay", "action": "pay", "method": "CASH", "module": "pos", "saleId": "cmf6mio7e000kitps1rxqt1oc", "hasMasked": true, "paymentId": "cmf6mio89000oitps58mtp0u1"}
cmf6mio9t000uitpsmtyg6p13	t1	system	event	/api/pos/stripe/webhook	2025-09-05 09:19:25.024	{"route": "/api/pos/stripe/webhook", "module": "pos", "status": "not_configured", "hasMasked": true}
\.


--
-- Data for Name: BackupJob; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BackupJob" (id, "tenantId", "ranAt", ok, summary) FROM stdin;
\.


--
-- Data for Name: BankAccount; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BankAccount" (id, "tenantId", code, name, currency, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: BankConnection; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BankConnection" (id, provider, status, "institutionId", "consentId", "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: BankReconciliation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BankReconciliation" (id, "tenantId", "bankAccountId", "fromDate", "toDate", "statementBal", "reconciledAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: BankStatementLine; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BankStatementLine" (id, "tenantId", "bankAccountId", date, description, amount, reference, reconciled, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: BillingPlan; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BillingPlan" (id, code, name, currency, "unitPriceMinor", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: BomItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BomItem" (id, "tenantId", "parentItemCode", "componentItemCode", quantity, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Capa; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Capa" (id, "tenantId", title, "rootCause", actions, "ownerId", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CapacityCalendar; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CapacityCalendar" (id, "tenantId", "resourceCode", date, "availableMins", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Channel; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Channel" (id, "tenantId", provider, name, config, active, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CoaTemplate; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CoaTemplate" (id, code, name, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CoaTemplateLine; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CoaTemplateLine" (id, "templateId", code, name, type) FROM stdin;
\.


--
-- Data for Name: ConsolidationMap; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ConsolidationMap" (id, "groupCode", "entityId", account, "mapTo", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CurrencyRate; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CurrencyRate" (id, "fromCode", "toCode", rate, "asOfDate") FROM stdin;
\.


--
-- Data for Name: CustomerInvoice; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CustomerInvoice" (id, "tenantId", number, "customerId", currency, total, status, "issuedAt", "dueAt", "createdAt", "updatedAt") FROM stdin;
cmfjel7f30003u1f7ranwmbx2	cmfjel7ee0000u1f734juv4ki	INV-0001	CUST-001	GBP	199.000000000000000000000000000000	draft	2025-09-14 07:58:26.51	2025-09-21 07:58:26.51	2025-09-14 07:58:26.511	2025-09-14 07:58:26.511
\.


--
-- Data for Name: CustomerPayment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CustomerPayment" (id, "tenantId", "invoiceId", amount, "paidAt", method, reference, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Deduction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Deduction" (id, "payslipId", name, amount, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: DemoDataVisibility; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DemoDataVisibility" (id, "tenantId", "adminUserId", "visibleUntil", "maskLevel") FROM stdin;
\.


--
-- Data for Name: DepreciationSchedule; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DepreciationSchedule" (id, "tenantId", "assetId", period, amount, posted, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: DrDrill; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DrDrill" (id, "tenantId", "ranAt", ok, "restoredCounts", notes) FROM stdin;
\.


--
-- Data for Name: EdiMessage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."EdiMessage" (id, "tenantId", direction, type, payload, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Employee; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Employee" (id, "tenantId", "empNo", "firstName", "lastName", email, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Entity; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Entity" (id, "tenantId", name, "currencyCode", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: EntityExt; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."EntityExt" (id, "entityId", "vatNumber", eori, meta, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: FixedAsset; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."FixedAsset" (id, "tenantId", "assetCode", name, category, cost, salvage, "usefulLifeM", "acquiredAt", "disposedAt", "disposalProceeds", "disposalNotes", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: FixedAssetDisposal; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."FixedAssetDisposal" (id, "tenantId", "assetId", "disposedAt", proceeds, "gainLoss", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: HubspotCompany; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."HubspotCompany" (id, "tenantId", "hsId", name, domain, "lastSyncAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: HubspotContact; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."HubspotContact" (id, "tenantId", "hsId", email, "firstName", "lastName", phone, "lastSyncAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: HubspotDeal; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."HubspotDeal" (id, "tenantId", "hsId", name, amount, stage, "closeDate", "lastSyncAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: IndustryInsight; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."IndustryInsight" (id, "tenantId", sector, title, content, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: IndustryWidget; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."IndustryWidget" (id, "tenantId", sector, code, config, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: IntercompanyTxn; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."IntercompanyTxn" (id, "fromEntityId", "toEntityId", ref, amount, currency, "postedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: InventoryItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."InventoryItem" (id, "tenantId", sku, "qtyOnHand", "warehouseId", "locationId", "createdAt", "updatedAt") FROM stdin;
cmfjel7fb0004u1f7apab82t8	cmfjel7ee0000u1f734juv4ki	DEMO-001	50.000000000000000000000000000000	\N	\N	2025-09-14 07:58:26.52	2025-09-14 07:58:26.52
\.


--
-- Data for Name: InventoryLot; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."InventoryLot" (id, "tenantId", sku, qty, "unitCost", "receivedAt", "warehouseId", "locationId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Invoice; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Invoice" (id, "tenantId", number, "pdfHash", total, "currencyCode", "issuedAt", "dueAt", status) FROM stdin;
\.


--
-- Data for Name: JournalEntry; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."JournalEntry" (id, "tenantId", "docRef", memo, "postedAt", "createdAt", "updatedAt") FROM stdin;
cmf6khqnq0002itpsfu29h2mc	t1	\N	POS sale POS-MAIN-20250905-0001	2025-09-05 08:22:42.231	2025-09-05 08:22:42.231	2025-09-05 08:22:42.231
cmf6mfcbl000ditpsg5relmpu	t1	\N	POS sale POS-MAIN-20250905-0002	2025-09-05 09:16:49.57	2025-09-05 09:16:49.57	2025-09-05 09:16:49.57
cmf6mio8i000pitpsi8ou1zhn	t1	\N	POS sale POS-MAIN-20250905-0003	2025-09-05 09:19:24.979	2025-09-05 09:19:24.979	2025-09-05 09:19:24.979
\.


--
-- Data for Name: JournalLine; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."JournalLine" (id, "entryId", "accountId", debit, credit, "createdAt", "updatedAt") FROM stdin;
cmf6khqnq0005itps4fjl8ud3	cmf6khqnq0002itpsfu29h2mc	cmf6kgcq00004it62g6ll773q	0.000000000000000000000000000000	50.000000000000000000000000000000	2025-09-05 08:22:42.231	2025-09-05 08:22:42.231
cmf6khqnq0004itpsn1lsoh6n	cmf6khqnq0002itpsfu29h2mc	cmf6kgcpz0003it629wxz084y	0.000000000000000000000000000000	250.000000000000000000000000000000	2025-09-05 08:22:42.231	2025-09-05 08:22:42.231
cmf6khqnq0003itpsrrw5fz4m	cmf6khqnq0002itpsfu29h2mc	cmf6kgcpw0002it62gj2j1pt4	300.000000000000000000000000000000	0.000000000000000000000000000000	2025-09-05 08:22:42.231	2025-09-05 08:22:42.231
cmf6mfcbl000gitpsnebjkxgb	cmf6mfcbl000ditpsg5relmpu	cmf6kgcq00004it62g6ll773q	0.000000000000000000000000000000	50.000000000000000000000000000000	2025-09-05 09:16:49.57	2025-09-05 09:16:49.57
cmf6mfcbl000fitps7hogatn6	cmf6mfcbl000ditpsg5relmpu	cmf6kgcpz0003it629wxz084y	0.000000000000000000000000000000	250.000000000000000000000000000000	2025-09-05 09:16:49.57	2025-09-05 09:16:49.57
cmf6mfcbl000eitps1gc1oowu	cmf6mfcbl000ditpsg5relmpu	cmf6kgcpw0002it62gj2j1pt4	300.000000000000000000000000000000	0.000000000000000000000000000000	2025-09-05 09:16:49.57	2025-09-05 09:16:49.57
cmf6mio8i000sitps8ofgh1mx	cmf6mio8i000pitpsi8ou1zhn	cmf6kgcq00004it62g6ll773q	0.000000000000000000000000000000	50.000000000000000000000000000000	2025-09-05 09:19:24.979	2025-09-05 09:19:24.979
cmf6mio8i000ritpsnnkrl4z6	cmf6mio8i000pitpsi8ou1zhn	cmf6kgcpz0003it629wxz084y	0.000000000000000000000000000000	250.000000000000000000000000000000	2025-09-05 09:19:24.979	2025-09-05 09:19:24.979
cmf6mio8i000qitps3sz6aay6	cmf6mio8i000pitpsi8ou1zhn	cmf6kgcpw0002it62gj2j1pt4	300.000000000000000000000000000000	0.000000000000000000000000000000	2025-09-05 09:19:24.979	2025-09-05 09:19:24.979
\.


--
-- Data for Name: KpiSnapshot; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."KpiSnapshot" (id, "tenantId", name, value, "asOf", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Ledger; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Ledger" (id, "tenantId", "entryNo", account, debit, credit, "docRef", "postedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Listing; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Listing" (id, "tenantId", "channelId", sku, title, price, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Location; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Location" (id, "tenantId", "warehouseId", code, type, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: MrpPlan; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MrpPlan" (id, "tenantId", "itemCode", "planDate", "suggestedQty", recommendation, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Notification" (id, "tenantId", type, body, "readAt") FROM stdin;
\.


--
-- Data for Name: NotificationJob; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."NotificationJob" (id, "tenantId", "templateId", "to", channel, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: NotificationTemplate; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."NotificationTemplate" (id, "tenantId", code, name, subject, body, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: OrderExternal; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."OrderExternal" (id, "tenantId", "channelId", "extId", status, total, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PaySchedule; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PaySchedule" (id, "tenantId", name, frequency, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PayrollRun; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PayrollRun" (id, "tenantId", "scheduleId", "periodStart", "periodEnd", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Payslip; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Payslip" (id, "tenantId", "runId", "employeeId", "grossPay", "netPay", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PeriodClose; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PeriodClose" (id, "tenantId", "periodStart", "periodEnd", "closedBy", notes, "createdAt") FROM stdin;
\.


--
-- Data for Name: PickTask; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PickTask" (id, "tenantId", "waveId", sku, qty, "fromLocId", "toLocId", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Plan; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Plan" (id, code, name, tier, active) FROM stdin;
\.


--
-- Data for Name: PlanAddon; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PlanAddon" (id, code, name, active) FROM stdin;
\.


--
-- Data for Name: PoLine; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PoLine" (id, "poId", "lineNo", sku, qty, price, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PosEvent; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PosEvent" (id, "tenantId", "saleId", "shiftId", type, payload, "createdAt") FROM stdin;
\.


--
-- Data for Name: PosLine; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PosLine" (id, "tenantId", "saleId", sku, name, qty, "unitPrice", "taxRate", "lineTotal", "inventoryItemId") FROM stdin;
cmf6k9gay0003itosufut6462	t1	cmf6k9gax0002itosm64lynmt	SKU-001	Coffee 250ml	1.000000000000000000000000000000	250.000000000000000000000000000000	0.200000000000000000000000000000	300.000000000000000000000000000000	\N
cmf6mfc9v0009itpszpa94nik	t1	cmf6mfc9v0008itpsf3u3kdpk	SKU-001	Coffee 250ml	1.000000000000000000000000000000	250.000000000000000000000000000000	0.200000000000000000000000000000	300.000000000000000000000000000000	\N
cmf6mio7e000litpsa6z2ph3v	t1	cmf6mio7e000kitps1rxqt1oc	SKU-001	Coffee 250ml	1.000000000000000000000000000000	250.000000000000000000000000000000	0.200000000000000000000000000000	300.000000000000000000000000000000	\N
\.


--
-- Data for Name: PosPayment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PosPayment" (id, "tenantId", "saleId", method, amount, tip, "stripePaymentIntentId", "stripeChargeId", "createdAt") FROM stdin;
cmf6kgcp40001it62wbir34pe	t1	cmf6k9gax0002itosm64lynmt	cash	300.000000000000000000000000000000	\N	\N	\N	2025-09-05 08:21:37.48
cmf6khqnc0001itpsn4q1sfhw	t1	cmf6k9gax0002itosm64lynmt	cash	300.000000000000000000000000000000	\N	\N	\N	2025-09-05 08:22:42.216
cmf6mfcba000citpsuhdruv9k	t1	cmf6mfc9v0008itpsf3u3kdpk	cash	300.000000000000000000000000000000	\N	\N	\N	2025-09-05 09:16:49.559
cmf6mio89000oitps58mtp0u1	t1	cmf6mio7e000kitps1rxqt1oc	cash	300.000000000000000000000000000000	\N	\N	\N	2025-09-05 09:19:24.97
\.


--
-- Data for Name: PosRefund; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PosRefund" (id, "tenantId", "saleId", amount, reason, "stripeRefundId", "createdAt") FROM stdin;
\.


--
-- Data for Name: PosSale; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PosSale" (id, "tenantId", "storeId", "shiftId", "cashierUserId", "saleNumber", status, subtotal, tax, total, currency, "createdAt") FROM stdin;
cmf6k9gax0002itosm64lynmt	t1	cmf6k9g1o0000itos9rwpvsnt	\N	u1	POS-MAIN-20250905-0001	paid	250.000000000000000000000000000000	50.000000000000000000000000000000	300.000000000000000000000000000000	GBP	2025-09-05 08:16:15.562
cmf6mfc9v0008itpsf3u3kdpk	t1	cmf6k9g1o0000itos9rwpvsnt	\N	u1	POS-MAIN-20250905-0002	paid	250.000000000000000000000000000000	50.000000000000000000000000000000	300.000000000000000000000000000000	GBP	2025-09-05 09:16:49.507
cmf6mio7e000kitps1rxqt1oc	t1	cmf6k9g1o0000itos9rwpvsnt	\N	u1	POS-MAIN-20250905-0003	paid	250.000000000000000000000000000000	50.000000000000000000000000000000	300.000000000000000000000000000000	GBP	2025-09-05 09:19:24.939
\.


--
-- Data for Name: PurchaseOrder; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PurchaseOrder" (id, "tenantId", number, "supplierId", status, "orderDate", "expectedAt", currency, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: QualityHold; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."QualityHold" (id, "tenantId", sku, "lotId", reason, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: QualityInspection; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."QualityInspection" (id, "tenantId", "docType", "docId", status, findings, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: RoutingStep; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."RoutingStep" (id, "workOrderId", seq, "resourceCode", "durationMins", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ShipmentExternal; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ShipmentExternal" (id, "tenantId", "orderId", carrier, tracking, "shippedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SiemExportBatch; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SiemExportBatch" (id, "tenantId", "createdAt", "filePath", "recordCount", sha256) FROM stdin;
\.


--
-- Data for Name: Store; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Store" (id, "tenantId", name, code, address, timezone, "createdAt", "updatedAt") FROM stdin;
cmf6k9g1o0000itos9rwpvsnt	t1	Main Store	MAIN	\N	Europe/London	2025-09-05 08:16:15.229	2025-09-05 08:16:15.229
\.


--
-- Data for Name: Subscription; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Subscription" (id, "tenantId", "planId", status, "currentPeriodStart", "currentPeriodEnd", "cancelAt", "createdAt", "customerId", "trialEnd", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Supplier; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Supplier" (id, "tenantId", code, name, email, phone, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SupplierBill; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SupplierBill" (id, "tenantId", number, "supplierId", currency, total, status, "receivedAt", "dueAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SupplierPayment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SupplierPayment" (id, "tenantId", "billId", amount, "paidAt", method, reference, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Tenant; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Tenant" (id, name, "createdAt", "updatedAt") FROM stdin;
cmfjel7ee0000u1f734juv4ki	Nexa Demo	2025-09-14 07:58:26.487	2025-09-14 07:58:26.487
\.


--
-- Data for Name: ThirdPartyConnector; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ThirdPartyConnector" (id, "tenantId", provider, name, config, active, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TillShift; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TillShift" (id, "tenantId", "storeId", "openedByUserId", "closedByUserId", "openedAt", "closedAt", "openingFloat", "closingFloat", status) FROM stdin;
\.


--
-- Data for Name: TreasuryMovement; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TreasuryMovement" (id, "tenantId", type, amount, currency, notes, at, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: UsageEvent; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UsageEvent" (id, "tenantId", type, quantity, at, metadata) FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, tenant_id, email, role, "createdAt", "updatedAt", active, "mfaEnabled", "mfaSecret", "passwordHash") FROM stdin;
cmfjel7er0001u1f7eqtqxonx	cmfjel7ee0000u1f734juv4ki	nexaaierp@gmail.com	owner	2025-09-14 07:58:26.499	2025-09-14 08:02:34.191	t	f	\N	$2b$10$EWk6u3acOnBkLf09giyusu9PGjbgdAVvUTjYDTEbk.jek96C5OHLu
\.


--
-- Data for Name: VatReturn; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."VatReturn" (id, vrn, "periodKey", start, "end", due, status, "totalDue", "submittedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Warehouse; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Warehouse" (id, "tenantId", code, name, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Wave; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Wave" (id, "tenantId", number, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: WebhookEndpoint; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."WebhookEndpoint" (id, "tenantId", url, "secretHash", active) FROM stdin;
\.


--
-- Data for Name: WebhookEvent; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."WebhookEvent" (id, "endpointId", "eventType", "deliveredAt", status, payload, "eventId", "receivedAt", source) FROM stdin;
\.


--
-- Data for Name: WorkOrder; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."WorkOrder" (id, number, "tenantId", "itemCode", quantity, status, "startPlanned", "endPlanned", "startActual", "endActual", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
f0d1747b-96b2-445a-8472-602dffc53aec	574b76b1fb1a3bcac9e74bbba6e75dd1e094771c132945e4bc6e8456e4e2ddca	2025-09-04 22:31:03.602218+01	20250822145807_phase4_models	\N	\N	2025-09-04 22:31:03.578034+01	1
c12d5cb5-80bd-4425-a107-a1b9e5ebc82c	b633f843427712f38238ff45790d5288a652127935b7fd1aca72b1a5f7af3995	2025-09-04 22:31:03.608917+01	20250902195646_phase_a_connectors_models	\N	\N	2025-09-04 22:31:03.602809+01	1
2f111182-372a-4520-96ba-09d442e94cea	59b7a0a337b0d24783775c85e3350e6cc42b005456846e7a0b288f5d86664bdf	2025-09-04 22:31:03.610504+01	20250902203628_phase_a_connectors_models	\N	\N	2025-09-04 22:31:03.609195+01	1
b18378e0-f2fa-4112-9c7d-3566bd1caac6	148f99c450bbb55fceb45ab96793db538cbe1f9a50cd42f094e7742152f531c9	2025-09-04 22:31:03.620081+01	20250902222538_phase7_modules_initial	\N	\N	2025-09-04 22:31:03.610813+01	1
17cd40fb-af52-4565-85a7-3404794dc99b	0dc4d82bbd2550b6309a2afc17720d691fec04d92593fcdb548bb3a8c213a8e9	2025-09-04 22:31:03.63452+01	20250902222713_phase7_wms_models_fix	\N	\N	2025-09-04 22:31:03.620709+01	1
c79515a0-5375-429d-85d3-66a3d6c68a03	9dcf9ccabd1f4308da5b9d1804a7d21cf775c12d2ad4b288774e55de9f266e7a	2025-09-04 22:31:03.673775+01	20250902223232_phase7_payroll_fix	\N	\N	2025-09-04 22:31:03.635594+01	1
b7c73926-50d9-4b95-8767-591ea37d677d	740cb9b8df1d201824bbe8bfa080fc9ae6406f1117a5ada2bc6fd6f3fb6fb64e	2025-09-04 22:31:04.056733+01	20250904213104_init_nexa	\N	\N	2025-09-04 22:31:04.021074+01	1
6bbcbd80-6055-4372-b199-8ca0d0088148	64d7ef6a2891aa418a8e3f0ba498efd44a783931bd2346c7e06f4c9ef35cc336	2025-09-05 01:42:02.508534+01	20250905004202_pos_baseline	\N	\N	2025-09-05 01:42:02.489993+01	1
6ba6d8de-90c7-453c-8879-0a46e8b6ffb0	966e8604bbcc98401442dcf81e89e76a90a85c3aa9a314ef269cf4c96b7f32c6	2025-09-14 09:23:14.830994+01	20250914082314_add_user_passwordhash	\N	\N	2025-09-14 09:23:14.828623+01	1
0c5ff1b0-cf23-47d8-9045-60f0f2f854f7	7b1b8fdff6ff35fa09bce3cffe53f8cd04fcfcb9c64a3adc37ec6a036b3764de	2025-09-14 20:48:42.80044+01	999_byok_tenant_keys	\N	\N	2025-09-14 20:48:42.770646+01	1
\.


--
-- Data for Name: tenant_keys; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tenant_keys (tenant_id, enc_key, alg, version, rotated_at, created_at) FROM stdin;
\.


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: Allowance Allowance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Allowance"
    ADD CONSTRAINT "Allowance_pkey" PRIMARY KEY (id);


--
-- Name: ApiKey ApiKey_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ApiKey"
    ADD CONSTRAINT "ApiKey_pkey" PRIMARY KEY (id);


--
-- Name: Asn Asn_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Asn"
    ADD CONSTRAINT "Asn_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: BackupJob BackupJob_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BackupJob"
    ADD CONSTRAINT "BackupJob_pkey" PRIMARY KEY (id);


--
-- Name: BankAccount BankAccount_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BankAccount"
    ADD CONSTRAINT "BankAccount_pkey" PRIMARY KEY (id);


--
-- Name: BankConnection BankConnection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BankConnection"
    ADD CONSTRAINT "BankConnection_pkey" PRIMARY KEY (id);


--
-- Name: BankReconciliation BankReconciliation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BankReconciliation"
    ADD CONSTRAINT "BankReconciliation_pkey" PRIMARY KEY (id);


--
-- Name: BankStatementLine BankStatementLine_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BankStatementLine"
    ADD CONSTRAINT "BankStatementLine_pkey" PRIMARY KEY (id);


--
-- Name: BillingPlan BillingPlan_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BillingPlan"
    ADD CONSTRAINT "BillingPlan_pkey" PRIMARY KEY (id);


--
-- Name: BomItem BomItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BomItem"
    ADD CONSTRAINT "BomItem_pkey" PRIMARY KEY (id);


--
-- Name: Capa Capa_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Capa"
    ADD CONSTRAINT "Capa_pkey" PRIMARY KEY (id);


--
-- Name: CapacityCalendar CapacityCalendar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CapacityCalendar"
    ADD CONSTRAINT "CapacityCalendar_pkey" PRIMARY KEY (id);


--
-- Name: Channel Channel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Channel"
    ADD CONSTRAINT "Channel_pkey" PRIMARY KEY (id);


--
-- Name: CoaTemplateLine CoaTemplateLine_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CoaTemplateLine"
    ADD CONSTRAINT "CoaTemplateLine_pkey" PRIMARY KEY (id);


--
-- Name: CoaTemplate CoaTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CoaTemplate"
    ADD CONSTRAINT "CoaTemplate_pkey" PRIMARY KEY (id);


--
-- Name: ConsolidationMap ConsolidationMap_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ConsolidationMap"
    ADD CONSTRAINT "ConsolidationMap_pkey" PRIMARY KEY (id);


--
-- Name: CurrencyRate CurrencyRate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CurrencyRate"
    ADD CONSTRAINT "CurrencyRate_pkey" PRIMARY KEY (id);


--
-- Name: CustomerInvoice CustomerInvoice_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CustomerInvoice"
    ADD CONSTRAINT "CustomerInvoice_pkey" PRIMARY KEY (id);


--
-- Name: CustomerPayment CustomerPayment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CustomerPayment"
    ADD CONSTRAINT "CustomerPayment_pkey" PRIMARY KEY (id);


--
-- Name: Deduction Deduction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Deduction"
    ADD CONSTRAINT "Deduction_pkey" PRIMARY KEY (id);


--
-- Name: DemoDataVisibility DemoDataVisibility_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DemoDataVisibility"
    ADD CONSTRAINT "DemoDataVisibility_pkey" PRIMARY KEY (id);


--
-- Name: DepreciationSchedule DepreciationSchedule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DepreciationSchedule"
    ADD CONSTRAINT "DepreciationSchedule_pkey" PRIMARY KEY (id);


--
-- Name: DrDrill DrDrill_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DrDrill"
    ADD CONSTRAINT "DrDrill_pkey" PRIMARY KEY (id);


--
-- Name: EdiMessage EdiMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EdiMessage"
    ADD CONSTRAINT "EdiMessage_pkey" PRIMARY KEY (id);


--
-- Name: Employee Employee_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Employee"
    ADD CONSTRAINT "Employee_pkey" PRIMARY KEY (id);


--
-- Name: EntityExt EntityExt_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EntityExt"
    ADD CONSTRAINT "EntityExt_pkey" PRIMARY KEY (id);


--
-- Name: Entity Entity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Entity"
    ADD CONSTRAINT "Entity_pkey" PRIMARY KEY (id);


--
-- Name: FixedAssetDisposal FixedAssetDisposal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FixedAssetDisposal"
    ADD CONSTRAINT "FixedAssetDisposal_pkey" PRIMARY KEY (id);


--
-- Name: FixedAsset FixedAsset_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FixedAsset"
    ADD CONSTRAINT "FixedAsset_pkey" PRIMARY KEY (id);


--
-- Name: HubspotCompany HubspotCompany_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."HubspotCompany"
    ADD CONSTRAINT "HubspotCompany_pkey" PRIMARY KEY (id);


--
-- Name: HubspotContact HubspotContact_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."HubspotContact"
    ADD CONSTRAINT "HubspotContact_pkey" PRIMARY KEY (id);


--
-- Name: HubspotDeal HubspotDeal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."HubspotDeal"
    ADD CONSTRAINT "HubspotDeal_pkey" PRIMARY KEY (id);


--
-- Name: IndustryInsight IndustryInsight_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."IndustryInsight"
    ADD CONSTRAINT "IndustryInsight_pkey" PRIMARY KEY (id);


--
-- Name: IndustryWidget IndustryWidget_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."IndustryWidget"
    ADD CONSTRAINT "IndustryWidget_pkey" PRIMARY KEY (id);


--
-- Name: IntercompanyTxn IntercompanyTxn_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."IntercompanyTxn"
    ADD CONSTRAINT "IntercompanyTxn_pkey" PRIMARY KEY (id);


--
-- Name: InventoryItem InventoryItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InventoryItem"
    ADD CONSTRAINT "InventoryItem_pkey" PRIMARY KEY (id);


--
-- Name: InventoryLot InventoryLot_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InventoryLot"
    ADD CONSTRAINT "InventoryLot_pkey" PRIMARY KEY (id);


--
-- Name: Invoice Invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY (id);


--
-- Name: JournalEntry JournalEntry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JournalEntry"
    ADD CONSTRAINT "JournalEntry_pkey" PRIMARY KEY (id);


--
-- Name: JournalLine JournalLine_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JournalLine"
    ADD CONSTRAINT "JournalLine_pkey" PRIMARY KEY (id);


--
-- Name: KpiSnapshot KpiSnapshot_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."KpiSnapshot"
    ADD CONSTRAINT "KpiSnapshot_pkey" PRIMARY KEY (id);


--
-- Name: Ledger Ledger_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Ledger"
    ADD CONSTRAINT "Ledger_pkey" PRIMARY KEY (id);


--
-- Name: Listing Listing_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Listing"
    ADD CONSTRAINT "Listing_pkey" PRIMARY KEY (id);


--
-- Name: Location Location_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Location"
    ADD CONSTRAINT "Location_pkey" PRIMARY KEY (id);


--
-- Name: MrpPlan MrpPlan_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MrpPlan"
    ADD CONSTRAINT "MrpPlan_pkey" PRIMARY KEY (id);


--
-- Name: NotificationJob NotificationJob_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NotificationJob"
    ADD CONSTRAINT "NotificationJob_pkey" PRIMARY KEY (id);


--
-- Name: NotificationTemplate NotificationTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NotificationTemplate"
    ADD CONSTRAINT "NotificationTemplate_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: OrderExternal OrderExternal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderExternal"
    ADD CONSTRAINT "OrderExternal_pkey" PRIMARY KEY (id);


--
-- Name: PaySchedule PaySchedule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PaySchedule"
    ADD CONSTRAINT "PaySchedule_pkey" PRIMARY KEY (id);


--
-- Name: PayrollRun PayrollRun_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PayrollRun"
    ADD CONSTRAINT "PayrollRun_pkey" PRIMARY KEY (id);


--
-- Name: Payslip Payslip_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payslip"
    ADD CONSTRAINT "Payslip_pkey" PRIMARY KEY (id);


--
-- Name: PeriodClose PeriodClose_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PeriodClose"
    ADD CONSTRAINT "PeriodClose_pkey" PRIMARY KEY (id);


--
-- Name: PickTask PickTask_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PickTask"
    ADD CONSTRAINT "PickTask_pkey" PRIMARY KEY (id);


--
-- Name: PlanAddon PlanAddon_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PlanAddon"
    ADD CONSTRAINT "PlanAddon_pkey" PRIMARY KEY (id);


--
-- Name: Plan Plan_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Plan"
    ADD CONSTRAINT "Plan_pkey" PRIMARY KEY (id);


--
-- Name: PoLine PoLine_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PoLine"
    ADD CONSTRAINT "PoLine_pkey" PRIMARY KEY (id);


--
-- Name: PosEvent PosEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PosEvent"
    ADD CONSTRAINT "PosEvent_pkey" PRIMARY KEY (id);


--
-- Name: PosLine PosLine_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PosLine"
    ADD CONSTRAINT "PosLine_pkey" PRIMARY KEY (id);


--
-- Name: PosPayment PosPayment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PosPayment"
    ADD CONSTRAINT "PosPayment_pkey" PRIMARY KEY (id);


--
-- Name: PosRefund PosRefund_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PosRefund"
    ADD CONSTRAINT "PosRefund_pkey" PRIMARY KEY (id);


--
-- Name: PosSale PosSale_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PosSale"
    ADD CONSTRAINT "PosSale_pkey" PRIMARY KEY (id);


--
-- Name: PurchaseOrder PurchaseOrder_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PurchaseOrder"
    ADD CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY (id);


--
-- Name: QualityHold QualityHold_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."QualityHold"
    ADD CONSTRAINT "QualityHold_pkey" PRIMARY KEY (id);


--
-- Name: QualityInspection QualityInspection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."QualityInspection"
    ADD CONSTRAINT "QualityInspection_pkey" PRIMARY KEY (id);


--
-- Name: RoutingStep RoutingStep_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RoutingStep"
    ADD CONSTRAINT "RoutingStep_pkey" PRIMARY KEY (id);


--
-- Name: ShipmentExternal ShipmentExternal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ShipmentExternal"
    ADD CONSTRAINT "ShipmentExternal_pkey" PRIMARY KEY (id);


--
-- Name: SiemExportBatch SiemExportBatch_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SiemExportBatch"
    ADD CONSTRAINT "SiemExportBatch_pkey" PRIMARY KEY (id);


--
-- Name: Store Store_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Store"
    ADD CONSTRAINT "Store_pkey" PRIMARY KEY (id);


--
-- Name: Subscription Subscription_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_pkey" PRIMARY KEY (id);


--
-- Name: SupplierBill SupplierBill_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupplierBill"
    ADD CONSTRAINT "SupplierBill_pkey" PRIMARY KEY (id);


--
-- Name: SupplierPayment SupplierPayment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupplierPayment"
    ADD CONSTRAINT "SupplierPayment_pkey" PRIMARY KEY (id);


--
-- Name: Supplier Supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Supplier"
    ADD CONSTRAINT "Supplier_pkey" PRIMARY KEY (id);


--
-- Name: Tenant Tenant_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Tenant"
    ADD CONSTRAINT "Tenant_pkey" PRIMARY KEY (id);


--
-- Name: ThirdPartyConnector ThirdPartyConnector_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ThirdPartyConnector"
    ADD CONSTRAINT "ThirdPartyConnector_pkey" PRIMARY KEY (id);


--
-- Name: TillShift TillShift_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TillShift"
    ADD CONSTRAINT "TillShift_pkey" PRIMARY KEY (id);


--
-- Name: TreasuryMovement TreasuryMovement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TreasuryMovement"
    ADD CONSTRAINT "TreasuryMovement_pkey" PRIMARY KEY (id);


--
-- Name: UsageEvent UsageEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UsageEvent"
    ADD CONSTRAINT "UsageEvent_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: VatReturn VatReturn_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VatReturn"
    ADD CONSTRAINT "VatReturn_pkey" PRIMARY KEY (id);


--
-- Name: Warehouse Warehouse_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Warehouse"
    ADD CONSTRAINT "Warehouse_pkey" PRIMARY KEY (id);


--
-- Name: Wave Wave_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Wave"
    ADD CONSTRAINT "Wave_pkey" PRIMARY KEY (id);


--
-- Name: WebhookEndpoint WebhookEndpoint_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WebhookEndpoint"
    ADD CONSTRAINT "WebhookEndpoint_pkey" PRIMARY KEY (id);


--
-- Name: WebhookEvent WebhookEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WebhookEvent"
    ADD CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY (id);


--
-- Name: WorkOrder WorkOrder_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkOrder"
    ADD CONSTRAINT "WorkOrder_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: tenant_keys tenant_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_keys
    ADD CONSTRAINT tenant_keys_pkey PRIMARY KEY (tenant_id);


--
-- Name: Account_tenantId_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Account_tenantId_code_key" ON public."Account" USING btree ("tenantId", code);


--
-- Name: ApiKey_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ApiKey_tenantId_idx" ON public."ApiKey" USING btree ("tenantId");


--
-- Name: Asn_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Asn_number_key" ON public."Asn" USING btree (number);


--
-- Name: Asn_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Asn_tenantId_idx" ON public."Asn" USING btree ("tenantId");


--
-- Name: AuditLog_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AuditLog_tenantId_idx" ON public."AuditLog" USING btree ("tenantId");


--
-- Name: BackupJob_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BackupJob_tenantId_idx" ON public."BackupJob" USING btree ("tenantId");


--
-- Name: BankAccount_tenantId_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "BankAccount_tenantId_code_key" ON public."BankAccount" USING btree ("tenantId", code);


--
-- Name: BankReconciliation_tenantId_bankAccountId_fromDate_toDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BankReconciliation_tenantId_bankAccountId_fromDate_toDate_idx" ON public."BankReconciliation" USING btree ("tenantId", "bankAccountId", "fromDate", "toDate");


--
-- Name: BankStatementLine_tenantId_bankAccountId_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BankStatementLine_tenantId_bankAccountId_date_idx" ON public."BankStatementLine" USING btree ("tenantId", "bankAccountId", date);


--
-- Name: BillingPlan_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "BillingPlan_code_key" ON public."BillingPlan" USING btree (code);


--
-- Name: BomItem_parentItemCode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BomItem_parentItemCode_idx" ON public."BomItem" USING btree ("parentItemCode");


--
-- Name: BomItem_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BomItem_tenantId_idx" ON public."BomItem" USING btree ("tenantId");


--
-- Name: Capa_tenantId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Capa_tenantId_status_idx" ON public."Capa" USING btree ("tenantId", status);


--
-- Name: CapacityCalendar_tenantId_resourceCode_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CapacityCalendar_tenantId_resourceCode_date_idx" ON public."CapacityCalendar" USING btree ("tenantId", "resourceCode", date);


--
-- Name: Channel_tenantId_provider_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Channel_tenantId_provider_idx" ON public."Channel" USING btree ("tenantId", provider);


--
-- Name: CoaTemplate_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "CoaTemplate_code_key" ON public."CoaTemplate" USING btree (code);


--
-- Name: ConsolidationMap_groupCode_entityId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ConsolidationMap_groupCode_entityId_idx" ON public."ConsolidationMap" USING btree ("groupCode", "entityId");


--
-- Name: CustomerInvoice_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "CustomerInvoice_number_key" ON public."CustomerInvoice" USING btree (number);


--
-- Name: CustomerPayment_tenantId_invoiceId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CustomerPayment_tenantId_invoiceId_idx" ON public."CustomerPayment" USING btree ("tenantId", "invoiceId");


--
-- Name: DemoDataVisibility_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DemoDataVisibility_tenantId_idx" ON public."DemoDataVisibility" USING btree ("tenantId");


--
-- Name: DepreciationSchedule_tenantId_assetId_period_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DepreciationSchedule_tenantId_assetId_period_idx" ON public."DepreciationSchedule" USING btree ("tenantId", "assetId", period);


--
-- Name: DrDrill_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DrDrill_tenantId_idx" ON public."DrDrill" USING btree ("tenantId");


--
-- Name: EdiMessage_tenantId_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "EdiMessage_tenantId_type_idx" ON public."EdiMessage" USING btree ("tenantId", type);


--
-- Name: Employee_empNo_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Employee_empNo_key" ON public."Employee" USING btree ("empNo");


--
-- Name: Employee_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Employee_tenantId_idx" ON public."Employee" USING btree ("tenantId");


--
-- Name: Entity_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Entity_tenantId_idx" ON public."Entity" USING btree ("tenantId");


--
-- Name: FixedAssetDisposal_tenantId_assetId_disposedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "FixedAssetDisposal_tenantId_assetId_disposedAt_idx" ON public."FixedAssetDisposal" USING btree ("tenantId", "assetId", "disposedAt");


--
-- Name: FixedAsset_tenantId_assetCode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "FixedAsset_tenantId_assetCode_idx" ON public."FixedAsset" USING btree ("tenantId", "assetCode");


--
-- Name: HubspotCompany_hsId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "HubspotCompany_hsId_key" ON public."HubspotCompany" USING btree ("hsId");


--
-- Name: HubspotCompany_tenantId_hsId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "HubspotCompany_tenantId_hsId_idx" ON public."HubspotCompany" USING btree ("tenantId", "hsId");


--
-- Name: HubspotContact_hsId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "HubspotContact_hsId_key" ON public."HubspotContact" USING btree ("hsId");


--
-- Name: HubspotContact_tenantId_hsId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "HubspotContact_tenantId_hsId_idx" ON public."HubspotContact" USING btree ("tenantId", "hsId");


--
-- Name: HubspotDeal_hsId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "HubspotDeal_hsId_key" ON public."HubspotDeal" USING btree ("hsId");


--
-- Name: HubspotDeal_tenantId_hsId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "HubspotDeal_tenantId_hsId_idx" ON public."HubspotDeal" USING btree ("tenantId", "hsId");


--
-- Name: IndustryInsight_tenantId_sector_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IndustryInsight_tenantId_sector_idx" ON public."IndustryInsight" USING btree ("tenantId", sector);


--
-- Name: IndustryWidget_tenantId_sector_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IndustryWidget_tenantId_sector_idx" ON public."IndustryWidget" USING btree ("tenantId", sector);


--
-- Name: IntercompanyTxn_fromEntityId_toEntityId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IntercompanyTxn_fromEntityId_toEntityId_idx" ON public."IntercompanyTxn" USING btree ("fromEntityId", "toEntityId");


--
-- Name: IntercompanyTxn_ref_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IntercompanyTxn_ref_key" ON public."IntercompanyTxn" USING btree (ref);


--
-- Name: InventoryItem_tenantId_sku_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "InventoryItem_tenantId_sku_idx" ON public."InventoryItem" USING btree ("tenantId", sku);


--
-- Name: InventoryLot_tenantId_sku_receivedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "InventoryLot_tenantId_sku_receivedAt_idx" ON public."InventoryLot" USING btree ("tenantId", sku, "receivedAt");


--
-- Name: Invoice_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Invoice_number_key" ON public."Invoice" USING btree (number);


--
-- Name: Invoice_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Invoice_tenantId_idx" ON public."Invoice" USING btree ("tenantId");


--
-- Name: JournalEntry_tenantId_postedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "JournalEntry_tenantId_postedAt_idx" ON public."JournalEntry" USING btree ("tenantId", "postedAt");


--
-- Name: KpiSnapshot_tenantId_name_asOf_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "KpiSnapshot_tenantId_name_asOf_idx" ON public."KpiSnapshot" USING btree ("tenantId", name, "asOf");


--
-- Name: Ledger_tenantId_account_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Ledger_tenantId_account_idx" ON public."Ledger" USING btree ("tenantId", account);


--
-- Name: Listing_tenantId_channelId_sku_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Listing_tenantId_channelId_sku_idx" ON public."Listing" USING btree ("tenantId", "channelId", sku);


--
-- Name: Location_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Location_tenantId_idx" ON public."Location" USING btree ("tenantId");


--
-- Name: Location_warehouseId_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Location_warehouseId_code_idx" ON public."Location" USING btree ("warehouseId", code);


--
-- Name: MrpPlan_tenantId_itemCode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MrpPlan_tenantId_itemCode_idx" ON public."MrpPlan" USING btree ("tenantId", "itemCode");


--
-- Name: NotificationTemplate_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "NotificationTemplate_code_key" ON public."NotificationTemplate" USING btree (code);


--
-- Name: Notification_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Notification_tenantId_idx" ON public."Notification" USING btree ("tenantId");


--
-- Name: OrderExternal_extId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "OrderExternal_extId_key" ON public."OrderExternal" USING btree ("extId");


--
-- Name: OrderExternal_tenantId_channelId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OrderExternal_tenantId_channelId_idx" ON public."OrderExternal" USING btree ("tenantId", "channelId");


--
-- Name: Payslip_tenantId_runId_employeeId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Payslip_tenantId_runId_employeeId_idx" ON public."Payslip" USING btree ("tenantId", "runId", "employeeId");


--
-- Name: PeriodClose_tenantId_periodStart_periodEnd_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PeriodClose_tenantId_periodStart_periodEnd_idx" ON public."PeriodClose" USING btree ("tenantId", "periodStart", "periodEnd");


--
-- Name: PickTask_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PickTask_tenantId_idx" ON public."PickTask" USING btree ("tenantId");


--
-- Name: PlanAddon_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PlanAddon_code_key" ON public."PlanAddon" USING btree (code);


--
-- Name: Plan_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Plan_code_key" ON public."Plan" USING btree (code);


--
-- Name: PoLine_poId_lineNo_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PoLine_poId_lineNo_key" ON public."PoLine" USING btree ("poId", "lineNo");


--
-- Name: PosEvent_tenantId_saleId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PosEvent_tenantId_saleId_createdAt_idx" ON public."PosEvent" USING btree ("tenantId", "saleId", "createdAt");


--
-- Name: PosEvent_tenantId_shiftId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PosEvent_tenantId_shiftId_createdAt_idx" ON public."PosEvent" USING btree ("tenantId", "shiftId", "createdAt");


--
-- Name: PosLine_tenantId_saleId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PosLine_tenantId_saleId_idx" ON public."PosLine" USING btree ("tenantId", "saleId");


--
-- Name: PosPayment_tenantId_saleId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PosPayment_tenantId_saleId_idx" ON public."PosPayment" USING btree ("tenantId", "saleId");


--
-- Name: PosPayment_tenantId_stripePaymentIntentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PosPayment_tenantId_stripePaymentIntentId_idx" ON public."PosPayment" USING btree ("tenantId", "stripePaymentIntentId");


--
-- Name: PosRefund_tenantId_saleId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PosRefund_tenantId_saleId_idx" ON public."PosRefund" USING btree ("tenantId", "saleId");


--
-- Name: PosRefund_tenantId_stripeRefundId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PosRefund_tenantId_stripeRefundId_idx" ON public."PosRefund" USING btree ("tenantId", "stripeRefundId");


--
-- Name: PosSale_tenantId_saleNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PosSale_tenantId_saleNumber_key" ON public."PosSale" USING btree ("tenantId", "saleNumber");


--
-- Name: PosSale_tenantId_shiftId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PosSale_tenantId_shiftId_idx" ON public."PosSale" USING btree ("tenantId", "shiftId");


--
-- Name: PosSale_tenantId_storeId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PosSale_tenantId_storeId_createdAt_idx" ON public."PosSale" USING btree ("tenantId", "storeId", "createdAt");


--
-- Name: PurchaseOrder_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PurchaseOrder_number_key" ON public."PurchaseOrder" USING btree (number);


--
-- Name: PurchaseOrder_tenantId_supplierId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PurchaseOrder_tenantId_supplierId_idx" ON public."PurchaseOrder" USING btree ("tenantId", "supplierId");


--
-- Name: QualityHold_tenantId_sku_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "QualityHold_tenantId_sku_idx" ON public."QualityHold" USING btree ("tenantId", sku);


--
-- Name: QualityInspection_tenantId_docType_docId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "QualityInspection_tenantId_docType_docId_idx" ON public."QualityInspection" USING btree ("tenantId", "docType", "docId");


--
-- Name: RoutingStep_workOrderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RoutingStep_workOrderId_idx" ON public."RoutingStep" USING btree ("workOrderId");


--
-- Name: SiemExportBatch_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SiemExportBatch_tenantId_idx" ON public."SiemExportBatch" USING btree ("tenantId");


--
-- Name: Store_tenantId_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Store_tenantId_code_key" ON public."Store" USING btree ("tenantId", code);


--
-- Name: Store_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Store_tenantId_idx" ON public."Store" USING btree ("tenantId");


--
-- Name: Subscription_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Subscription_tenantId_idx" ON public."Subscription" USING btree ("tenantId");


--
-- Name: SupplierBill_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "SupplierBill_number_key" ON public."SupplierBill" USING btree (number);


--
-- Name: SupplierPayment_tenantId_billId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SupplierPayment_tenantId_billId_idx" ON public."SupplierPayment" USING btree ("tenantId", "billId");


--
-- Name: Supplier_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Supplier_code_key" ON public."Supplier" USING btree (code);


--
-- Name: Supplier_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Supplier_tenantId_idx" ON public."Supplier" USING btree ("tenantId");


--
-- Name: ThirdPartyConnector_tenantId_provider_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ThirdPartyConnector_tenantId_provider_idx" ON public."ThirdPartyConnector" USING btree ("tenantId", provider);


--
-- Name: TillShift_tenantId_storeId_openedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TillShift_tenantId_storeId_openedAt_idx" ON public."TillShift" USING btree ("tenantId", "storeId", "openedAt");


--
-- Name: TreasuryMovement_tenantId_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TreasuryMovement_tenantId_type_idx" ON public."TreasuryMovement" USING btree ("tenantId", type);


--
-- Name: UsageEvent_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UsageEvent_tenantId_idx" ON public."UsageEvent" USING btree ("tenantId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_tenant_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_tenant_id_idx" ON public."User" USING btree (tenant_id);


--
-- Name: VatReturn_vrn_periodKey_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "VatReturn_vrn_periodKey_idx" ON public."VatReturn" USING btree (vrn, "periodKey");


--
-- Name: Warehouse_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Warehouse_code_key" ON public."Warehouse" USING btree (code);


--
-- Name: Warehouse_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Warehouse_tenantId_idx" ON public."Warehouse" USING btree ("tenantId");


--
-- Name: Wave_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Wave_number_key" ON public."Wave" USING btree (number);


--
-- Name: Wave_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Wave_tenantId_idx" ON public."Wave" USING btree ("tenantId");


--
-- Name: WebhookEndpoint_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "WebhookEndpoint_tenantId_idx" ON public."WebhookEndpoint" USING btree ("tenantId");


--
-- Name: WorkOrder_itemCode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "WorkOrder_itemCode_idx" ON public."WorkOrder" USING btree ("itemCode");


--
-- Name: WorkOrder_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "WorkOrder_number_key" ON public."WorkOrder" USING btree (number);


--
-- Name: WorkOrder_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "WorkOrder_tenantId_idx" ON public."WorkOrder" USING btree ("tenantId");


--
-- Name: Allowance Allowance_payslipId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Allowance"
    ADD CONSTRAINT "Allowance_payslipId_fkey" FOREIGN KEY ("payslipId") REFERENCES public."Payslip"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: BankStatementLine BankStatementLine_bankAccountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BankStatementLine"
    ADD CONSTRAINT "BankStatementLine_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES public."BankAccount"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CoaTemplateLine CoaTemplateLine_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CoaTemplateLine"
    ADD CONSTRAINT "CoaTemplateLine_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."CoaTemplate"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Deduction Deduction_payslipId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Deduction"
    ADD CONSTRAINT "Deduction_payslipId_fkey" FOREIGN KEY ("payslipId") REFERENCES public."Payslip"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DepreciationSchedule DepreciationSchedule_assetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DepreciationSchedule"
    ADD CONSTRAINT "DepreciationSchedule_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES public."FixedAsset"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FixedAssetDisposal FixedAssetDisposal_assetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FixedAssetDisposal"
    ADD CONSTRAINT "FixedAssetDisposal_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES public."FixedAsset"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: InventoryItem InventoryItem_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InventoryItem"
    ADD CONSTRAINT "InventoryItem_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public."Location"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: InventoryItem InventoryItem_warehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InventoryItem"
    ADD CONSTRAINT "InventoryItem_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES public."Warehouse"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: JournalLine JournalLine_accountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JournalLine"
    ADD CONSTRAINT "JournalLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES public."Account"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: JournalLine JournalLine_entryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JournalLine"
    ADD CONSTRAINT "JournalLine_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES public."JournalEntry"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Listing Listing_channelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Listing"
    ADD CONSTRAINT "Listing_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES public."Channel"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Location Location_warehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Location"
    ADD CONSTRAINT "Location_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES public."Warehouse"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: NotificationJob NotificationJob_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NotificationJob"
    ADD CONSTRAINT "NotificationJob_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."NotificationTemplate"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderExternal OrderExternal_channelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderExternal"
    ADD CONSTRAINT "OrderExternal_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES public."Channel"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PayrollRun PayrollRun_scheduleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PayrollRun"
    ADD CONSTRAINT "PayrollRun_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES public."PaySchedule"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Payslip Payslip_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payslip"
    ADD CONSTRAINT "Payslip_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Payslip Payslip_runId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payslip"
    ADD CONSTRAINT "Payslip_runId_fkey" FOREIGN KEY ("runId") REFERENCES public."PayrollRun"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PickTask PickTask_fromLocId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PickTask"
    ADD CONSTRAINT "PickTask_fromLocId_fkey" FOREIGN KEY ("fromLocId") REFERENCES public."Location"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PickTask PickTask_toLocId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PickTask"
    ADD CONSTRAINT "PickTask_toLocId_fkey" FOREIGN KEY ("toLocId") REFERENCES public."Location"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PickTask PickTask_waveId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PickTask"
    ADD CONSTRAINT "PickTask_waveId_fkey" FOREIGN KEY ("waveId") REFERENCES public."Wave"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PoLine PoLine_poId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PoLine"
    ADD CONSTRAINT "PoLine_poId_fkey" FOREIGN KEY ("poId") REFERENCES public."PurchaseOrder"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PosEvent PosEvent_saleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PosEvent"
    ADD CONSTRAINT "PosEvent_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES public."PosSale"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PosEvent PosEvent_shiftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PosEvent"
    ADD CONSTRAINT "PosEvent_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES public."TillShift"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PosLine PosLine_saleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PosLine"
    ADD CONSTRAINT "PosLine_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES public."PosSale"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PosPayment PosPayment_saleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PosPayment"
    ADD CONSTRAINT "PosPayment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES public."PosSale"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PosRefund PosRefund_saleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PosRefund"
    ADD CONSTRAINT "PosRefund_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES public."PosSale"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PosSale PosSale_shiftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PosSale"
    ADD CONSTRAINT "PosSale_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES public."TillShift"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PosSale PosSale_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PosSale"
    ADD CONSTRAINT "PosSale_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public."Store"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PurchaseOrder PurchaseOrder_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PurchaseOrder"
    ADD CONSTRAINT "PurchaseOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."Supplier"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RoutingStep RoutingStep_workOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RoutingStep"
    ADD CONSTRAINT "RoutingStep_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES public."WorkOrder"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ShipmentExternal ShipmentExternal_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ShipmentExternal"
    ADD CONSTRAINT "ShipmentExternal_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."OrderExternal"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TillShift TillShift_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TillShift"
    ADD CONSTRAINT "TillShift_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public."Store"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

