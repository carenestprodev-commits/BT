import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  Copy,
  Landmark,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { BASE_URL } from "../../Redux/config";
import { fetchWithAuth } from "../../lib/fetchWithAuth";
import AdminPagination from "../../Components/Admin/AdminPagination";
import { useAdminCollection } from "../../hooks/useAdminCollection";
import { useSearchParams } from "react-router-dom";

const SERVICES = [
  ["childcare", "Child care"],
  ["elderlycare", "Senior and adult care"],
  ["tutoring", "Tutoring"],
  ["housekeeping", "Housekeeping"],
];

const SECTION_META = {
  overview: {
    label: "Overview",
    description: "Review organisation budgets, usage and programme status.",
  },
  employees: {
    label: "Employees",
    description: "Approve employees and manage their care allowances.",
  },
  careRules: {
    label: "Care rules",
    description: "Set budgets, allowances, billing terms and programme dates.",
  },
  coveredServices: {
    label: "Covered services",
    description: "Choose which care services employees can use with credits.",
  },
  spendingHistory: {
    label: "Spending history",
    description: "Review care credit usage and remaining balances.",
  },
  billing: {
    label: "Billing",
    description: "Issue invoices and track payment status.",
  },
};

const money = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
const dateValue = () => new Date().toISOString().slice(0, 10);
const api = (path, options) =>
  fetchWithAuth(`${BASE_URL}/api/admin/organisations/${path}`, options);

function Status({ value }) {
  const tone =
    value === "active" || value === "approved" || value === "paid"
      ? "bg-emerald-50 text-emerald-700"
      : value === "pending" || value === "issued"
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-100 text-slate-600";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${tone}`}
    >
      {String(value || "not issued").replaceAll("_", " ")}
    </span>
  );
}

function Organisations({ section = "overview" }) {
  const sectionMeta = SECTION_META[section] || SECTION_META.overview;
  const [searchParams, setSearchParams] = useSearchParams();
  const organisationId = searchParams.get("organisation");
  const [selected, setSelected] = useState(null);
  const [members, setMembers] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [invoiceFilter, setInvoiceFilter] = useState("All");
  const [detailPages, setDetailPages] = useState({
    members: { page: 1, count: 0 },
    ledger: { page: 1, count: 0 },
    invoices: { page: 1, count: 0 },
  });
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [notice, setNotice] = useState("");

  const collection = useAdminCollection({
    path: "/api/admin/organisations/",
    pageSize: 10,
    params: {
      ...(query.trim() ? { search: query.trim() } : {}),
      ...(statusFilter !== "All" ? { status: statusFilter } : {}),
      ...(invoiceFilter !== "All" ? { invoice_status: invoiceFilter } : {}),
    },
  });
  const {
    rows: items,
    page,
    setPage,
    count: totalCount,
    pageSize,
    totalPages,
    loading,
    error: collectionError,
  } = collection;

  const loadDetail = useCallback(async (organisation) => {
    setDetailLoading(true);
    try {
      const [
        detailResponse,
        membersResponse,
        ledgerResponse,
        invoicesResponse,
      ] = await Promise.all([
        api(`${organisation.id}/`),
        api(`${organisation.id}/members/?page_size=10`),
        api(`${organisation.id}/ledger/?page_size=10`),
        api(`${organisation.id}/invoices/?page_size=10`),
      ]);
      const [detail, nextMembers, nextLedger, nextInvoices] = await Promise.all(
        [
          detailResponse.json(),
          membersResponse.json(),
          ledgerResponse.json(),
          invoicesResponse.json(),
        ],
      );
      if (!detailResponse.ok)
        throw new Error(detail?.detail || "Could not load organisation.");
      setSelected(detail);
      setMembers(nextMembers.results);
      setLedger(nextLedger.results);
      setInvoices(nextInvoices.results);
      setDetailPages({
        members: { page: nextMembers.page, count: nextMembers.count },
        ledger: { page: nextLedger.page, count: nextLedger.count },
        invoices: { page: nextInvoices.page, count: nextInvoices.count },
      });
    } catch (loadError) {
      setError(loadError.message || "Could not load organisation.");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!organisationId) {
      setSelected(null);
      return;
    }
    const organisation = items.find(
      (item) => String(item.id) === String(organisationId),
    );
    if (organisation && String(selected?.id) !== String(organisation.id)) {
      loadDetail(organisation);
    }
  }, [items, loadDetail, organisationId, selected?.id]);

  const selectOrganisation = (organisation) => {
    setSearchParams(
      (current) => {
        current.set("organisation", String(organisation.id));
        return current;
      },
      { replace: true },
    );
  };

  const loadDetailPage = async (kind, nextPage) => {
    const response = await api(
      `${selected.id}/${kind}/?page=${nextPage}&page_size=10`,
    );
    const data = await response.json();
    if (!response.ok)
      return setError(data?.detail || `Could not load ${kind}.`);
    if (kind === "members") setMembers(data.results);
    if (kind === "ledger") setLedger(data.results);
    if (kind === "invoices") setInvoices(data.results);
    setDetailPages((current) => ({
      ...current,
      [kind]: { page: data.page, count: data.count },
    }));
  };

  const refreshDetail = async () => {
    if (selected) await loadDetail(selected);
    await collection.reload();
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(selected.enrollment_code);
    setNotice("Code copied");
  };

  const codeAction = async (action) => {
    const response = await api(`${selected.id}/code/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await response.json();
    if (!response.ok) return setError(data?.action || "Could not update code.");
    setSelected(data);
    setNotice(action === "revoke" ? "Code revoked" : "New code generated");
    collection.reload();
  };

  const updateMember = async (membership, status, allowanceOverride) => {
    const payload = {};
    if (status) payload.status = status;
    if (allowanceOverride !== undefined)
      payload.allowance_override =
        allowanceOverride === "" ? null : allowanceOverride;
    const response = await api(`members/${membership.id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok)
      return setError(data?.detail || "Could not update member.");
    setMembers((current) =>
      current.map((item) => (item.id === data.id ? data : item)),
    );
    setNotice(status ? `Member ${status}` : "Member allowance updated");
  };

  const issueInvoice = async () => {
    const response = await api(`${selected.id}/invoices/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    const data = await response.json();
    if (!response.ok)
      return setError(data?.detail || "Could not issue invoice.");
    setInvoices((current) => [
      data,
      ...current.filter((item) => item.id !== data.id),
    ]);
    setNotice("Invoice issued");
  };

  const invoiceAction = async (invoice, status) => {
    const response = await api(`invoices/${invoice.id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await response.json();
    if (!response.ok)
      return setError(data?.detail || "Could not update invoice.");
    setInvoices((current) =>
      current.map((item) => (item.id === data.id ? data : item)),
    );
    setNotice(`Invoice marked ${status}`);
  };

  const detailKey = {
    employees: "members",
    spendingHistory: "ledger",
    billing: "invoices",
  }[section];
  let sectionContent = <OrganisationOverview organisation={selected} />;
  if (section === "employees") {
    sectionContent = <Members rows={members} onAction={updateMember} />;
  }
  if (section === "careRules") {
    sectionContent = <Rules organisation={selected} onSaved={refreshDetail} />;
  }
  if (section === "coveredServices") {
    sectionContent = (
      <Services organisation={selected} onSaved={refreshDetail} />
    );
  }
  if (section === "spendingHistory") {
    sectionContent = <Ledger rows={ledger} />;
  }
  if (section === "billing") {
    sectionContent = (
      <Invoices
        rows={invoices}
        onIssue={issueInvoice}
        onAction={invoiceAction}
      />
    );
  }

  return (
    <div className="min-h-full bg-[#f3f7fb] p-4 font-sfpro text-[#1d3447] sm:p-6">
      <div className="mx-auto max-w-[1440px]">
        <header className="mb-6 flex flex-col gap-4 border-b border-[#dce7ee] pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1686a5]">
              Care credits
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#123047]">
              {sectionMeta.label}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {sectionMeta.description}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0f708a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0c6278] active:translate-y-px"
          >
            <Plus className="h-4 w-4" />
            Create organisation
          </button>
        </header>

        {notice && (
          <div className="mb-4 flex items-center justify-between border-l-4 border-emerald-500 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <span>{notice}</span>
            <button onClick={() => setNotice("")}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {(error || collectionError) && (
          <div className="mb-4 flex items-center justify-between border-l-4 border-rose-500 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <span>{error || collectionError}</span>
            <button onClick={() => setError("")}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid gap-5 xl:grid-cols-[minmax(360px,0.82fr)_minmax(0,1.7fr)]">
          <section className="min-w-0 border border-[#dce7ee] bg-white">
            <div className="border-b border-[#e7eef3] p-4">
              <label className="flex items-center gap-2 rounded-lg border border-[#ccdce6] px-3 py-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => {
                    collection.setPage(1);
                    setQuery(event.target.value);
                  }}
                  placeholder="Search name, code or acronym"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </label>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    collection.setPage(1);
                    setStatusFilter(event.target.value);
                  }}
                  className="rounded-lg border border-[#ccdce6] bg-white px-2 py-2 text-xs text-slate-600"
                >
                  <option value="All">All programmes</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="ended">Ended</option>
                </select>
                <select
                  value={invoiceFilter}
                  onChange={(event) => {
                    collection.setPage(1);
                    setInvoiceFilter(event.target.value);
                  }}
                  className="rounded-lg border border-[#ccdce6] bg-white px-2 py-2 text-xs text-slate-600"
                >
                  <option value="All">All invoices</option>
                  <option value="issued">Issued</option>
                  <option value="overdue">Overdue</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
            {loading ? (
              <Loading label="Loading organisations" />
            ) : items.length === 0 ? (
              <Empty
                title="No organisations yet"
                body="Create an employer organisation to issue care credits."
              />
            ) : (
              <div className="divide-y divide-[#e8eff4]">
                {items.map((organisation) => (
                  <button
                    key={organisation.id}
                    onClick={() => selectOrganisation(organisation)}
                    className={`w-full px-4 py-4 text-left transition hover:bg-[#f6fafc] ${selected?.id === organisation.id ? "bg-[#ecf7fa]" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#1d3447]">
                          {organisation.name}
                        </p>
                        <p className="mt-1 font-mono text-xs uppercase tracking-wide text-slate-500">
                          {organisation.enrollment_code}
                        </p>
                      </div>
                      <Status value={organisation.status} />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                      <Metric
                        label="Cap"
                        value={money(organisation.monthly_cap)}
                      />
                      <Metric
                        label="Used"
                        value={money(organisation.consumed_amount)}
                      />
                      <Metric
                        label="Members"
                        value={organisation.active_members}
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
            <AdminPagination
              page={page}
              count={totalCount}
              pageSize={pageSize}
              totalPages={totalPages}
              onPage={setPage}
            />
          </section>

          <section className="min-w-0 border border-[#dce7ee] bg-white">
            {detailLoading ? (
              <Loading label="Loading organisation" />
            ) : !selected ? (
              <Empty
                title="Select an organisation"
                body="Choose an organisation to manage budgets, services, members and invoices."
              />
            ) : (
              <>
                <div className="border-b border-[#e7eef3] px-5 py-5">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-[#1686a5]" />
                        <h3 className="text-xl font-semibold tracking-[-0.02em]">
                          {selected.name}
                        </h3>
                        <Status value={selected.status} />
                      </div>
                      <p className="mt-2 text-sm text-slate-500">
                        Default employee allowance:{" "}
                        {money(selected.default_allowance)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={copyCode}
                        disabled={!selected.code_active}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#ccdce6] px-3 py-2 text-xs font-semibold text-[#234258] disabled:opacity-50"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        {selected.enrollment_code}
                      </button>
                      <button
                        onClick={() => codeAction("regenerate")}
                        className="rounded-lg border border-[#ccdce6] p-2 text-[#3b6077]"
                        title="Regenerate code"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => codeAction("revoke")}
                        className="rounded-lg border border-[#ccdce6] px-3 py-2 text-xs font-semibold text-[#9a4c3f]"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4">
                    <Metric
                      label="Monthly cap"
                      value={money(selected.monthly_cap)}
                    />
                    <Metric
                      label="Used"
                      value={money(selected.consumed_amount)}
                    />
                    <Metric
                      label="Available"
                      value={money(
                        Number(selected.monthly_cap) -
                          Number(selected.consumed_amount),
                      )}
                    />
                    <Metric
                      label="Active members"
                      value={selected.active_members}
                    />
                  </div>
                </div>
                <div className="p-5">
                  {sectionContent}
                  {detailKey && detailPages[detailKey] && (
                    <AdminPagination
                      page={detailPages[detailKey].page}
                      count={detailPages[detailKey].count}
                      pageSize={10}
                      totalPages={Math.max(
                        1,
                        Math.ceil(detailPages[detailKey].count / 10),
                      )}
                      onPage={(nextPage) => loadDetailPage(detailKey, nextPage)}
                    />
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
      {showCreate && (
        <CreateOrganisation
          onClose={() => setShowCreate(false)}
          onCreated={async (organisation) => {
            setShowCreate(false);
            setSearchParams(
              (current) => {
                current.set("organisation", String(organisation.id));
                return current;
              },
              { replace: true },
            );
            await collection.reload();
            await loadDetail(organisation);
          }}
        />
      )}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[#234258]">{value}</p>
    </div>
  );
}
function Loading({ label }) {
  return (
    <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-slate-500">
      <LoaderCircle className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}
function Empty({ title, body }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center px-8 text-center">
      <Landmark className="h-7 w-7 text-[#8da7b8]" />
      <p className="mt-3 font-semibold text-[#234258]">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-slate-500">{body}</p>
    </div>
  );
}

function OrganisationOverview({ organisation }) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm leading-6 text-slate-600">
        Use the Organisations menu in the sidebar to manage this programme. You
        can approve employees, set care rules, choose covered services, review
        spending and manage billing.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="border-l-2 border-[#42b9d8] pl-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Enrollment code
          </p>
          <p className="mt-1 font-mono text-sm font-semibold text-[#234258]">
            {organisation.enrollment_code}
          </p>
        </div>
        <div className="border-l-2 border-[#42b9d8] pl-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Programme dates
          </p>
          <p className="mt-1 text-sm font-semibold text-[#234258]">
            {organisation.starts_on}{" "}
            {organisation.ends_on ? `to ${organisation.ends_on}` : "onwards"}
          </p>
        </div>
      </div>
    </div>
  );
}

function Members({ rows, onAction }) {
  return rows.length === 0 ? (
    <Empty
      title="No employee requests"
      body="Employees who enter the organisation code will appear here for approval."
    />
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[790px] text-sm">
        <thead className="border-b border-[#e5eef3] text-left text-[11px] uppercase tracking-wide text-slate-400">
          <tr>
            <th className="pb-3">Employee</th>
            <th className="pb-3">Allowance</th>
            <th className="pb-3">Used</th>
            <th className="pb-3">Status</th>
            <th className="pb-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-[#edf2f5]">
          {rows.map((member) => (
            <tr key={member.id}>
              <td className="py-3">
                <p className="font-semibold">
                  {member.seeker_name || member.seeker_email}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {member.seeker_email}
                </p>
              </td>
              <td className="py-3">
                <p>{money(member.allowance)}</p>
                <input
                  defaultValue={member.allowance_override || ""}
                  onBlur={(event) => onAction(member, null, event.target.value)}
                  placeholder="Default allowance"
                  className="mt-1 w-28 border-b border-[#ccdce6] bg-transparent py-1 text-xs outline-none focus:border-[#0f708a]"
                />
              </td>
              <td className="py-3">
                {money(member.used_amount)}
                <span className="ml-1 text-xs text-slate-400">
                  / {money(member.available_amount)} left
                </span>
              </td>
              <td className="py-3">
                <Status value={member.status} />
              </td>
              <td className="py-3 text-right">
                {member.status === "pending" ? (
                  <span className="inline-flex gap-2">
                    <button
                      onClick={() => onAction(member, "approved")}
                      className="rounded-md bg-[#0f708a] px-2.5 py-1.5 text-xs font-semibold text-white"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onAction(member, "rejected")}
                      className="rounded-md border border-[#d5e0e6] px-2.5 py-1.5 text-xs font-semibold"
                    >
                      Reject
                    </button>
                  </span>
                ) : member.status === "approved" ? (
                  <button
                    onClick={() => onAction(member, "suspended")}
                    className="rounded-md border border-[#d5e0e6] px-2.5 py-1.5 text-xs font-semibold text-[#9a4c3f]"
                  >
                    Suspend
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Rules({ organisation, onSaved }) {
  const [form, setForm] = useState(() => ({
    monthly_cap: organisation.monthly_cap,
    default_allowance: organisation.default_allowance,
    billing_contact_name: organisation.billing_contact_name,
    billing_contact_email: organisation.billing_contact_email,
    status: organisation.status,
    starts_on: organisation.starts_on,
    ends_on: organisation.ends_on || "",
    invoice_terms_days: organisation.invoice_terms_days,
  }));
  const [saving, setSaving] = useState(false);
  const change = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    const response = await api(`${organisation.id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, ends_on: form.ends_on || null }),
    });
    setSaving(false);
    if (response.ok) onSaved();
  };
  return (
    <form onSubmit={save} className="max-w-2xl">
      <p className="text-sm text-slate-500">
        These rules apply to new care. Current confirmed care remains honoured
        when access is suspended or ended.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Monthly organisation cap">
          <input
            name="monthly_cap"
            type="number"
            min="0"
            value={form.monthly_cap}
            onChange={change}
            required
          />
        </Field>
        <Field label="Default employee allowance">
          <input
            name="default_allowance"
            type="number"
            min="0"
            value={form.default_allowance}
            onChange={change}
            required
          />
        </Field>
        <Field label="Billing contact">
          <input
            name="billing_contact_name"
            value={form.billing_contact_name}
            onChange={change}
          />
        </Field>
        <Field label="Billing email">
          <input
            name="billing_contact_email"
            type="email"
            value={form.billing_contact_email}
            onChange={change}
          />
        </Field>
        <Field label="Invoice terms (days)">
          <input
            name="invoice_terms_days"
            type="number"
            min="0"
            value={form.invoice_terms_days}
            onChange={change}
            required
          />
        </Field>
        <Field label="Programme status">
          <select name="status" value={form.status} onChange={change}>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="ended">Ended</option>
          </select>
        </Field>
        <Field label="Start date">
          <input
            name="starts_on"
            type="date"
            value={form.starts_on}
            onChange={change}
            required
          />
        </Field>
        <Field label="End date">
          <input
            name="ends_on"
            type="date"
            value={form.ends_on}
            onChange={change}
          />
        </Field>
      </div>
      <button
        disabled={saving}
        className="mt-6 rounded-lg bg-[#0f708a] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save rules"}
      </button>
    </form>
  );
}

function Services({ organisation, onSaved }) {
  const [values, setValues] = useState(organisation.eligible_services || []);
  const [saving, setSaving] = useState(false);
  const toggle = (value) =>
    setValues((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  const save = async () => {
    setSaving(true);
    await api(`${organisation.id}/services/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service_categories: values }),
    });
    setSaving(false);
    onSaved();
  };
  return (
    <div>
      <p className="max-w-xl text-sm text-slate-500">
        Only selected categories can use this organisation’s credits. Other care
        remains available through personal payment.
      </p>
      <div className="mt-5 divide-y divide-[#e8eff4] border-y border-[#e8eff4]">
        {SERVICES.map(([value, label]) => (
          <label
            key={value}
            className="flex cursor-pointer items-center justify-between py-3"
          >
            <span className="text-sm font-medium">{label}</span>
            <input
              type="checkbox"
              checked={values.includes(value)}
              onChange={() => toggle(value)}
              className="h-4 w-4 accent-[#0f708a]"
            />
          </label>
        ))}
      </div>
      <button
        onClick={save}
        disabled={saving || values.length === 0}
        className="mt-5 rounded-lg bg-[#0f708a] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save eligible services"}
      </button>
    </div>
  );
}

function Ledger({ rows }) {
  return rows.length === 0 ? (
    <Empty
      title="No credit activity"
      body="Ledger entries appear when approved employees start eligible care."
    />
  ) : (
    <div className="divide-y divide-[#edf2f5]">
      {rows.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center justify-between gap-4 py-3"
        >
          <div>
            <p className="text-sm font-semibold">{entry.description}</p>
            <p className="mt-1 text-xs text-slate-500">
              {entry.seeker_name} ·{" "}
              {new Date(entry.created_at).toLocaleDateString("en-NG")}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-[#9a4c3f]">
              -{money(entry.amount)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Balance {money(entry.balance_after)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Invoices({ rows, onIssue, onAction }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Monthly invoices charge only consumed credits.
        </p>
        <button
          onClick={onIssue}
          className="rounded-lg border border-[#ccdce6] px-3 py-2 text-xs font-semibold text-[#234258]"
        >
          Issue current invoice
        </button>
      </div>
      {rows.length === 0 ? (
        <Empty
          title="No invoices"
          body="Issue an invoice once the organisation has sponsored care in a period."
        />
      ) : (
        <div className="divide-y divide-[#edf2f5]">
          {rows.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between gap-4 py-3"
            >
              <div>
                <p className="font-semibold">{money(invoice.amount)}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Due {new Date(invoice.due_date).toLocaleDateString("en-NG")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Status value={invoice.status} />
                {invoice.status !== "paid" && invoice.status !== "void" && (
                  <button
                    onClick={() => onAction(invoice, "paid")}
                    className="text-xs font-semibold text-[#0f708a]"
                  >
                    Mark paid
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateOrganisation({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    acronym: "",
    billing_contact_name: "",
    billing_contact_email: "",
    starts_on: dateValue(),
    monthly_cap: "",
    default_allowance: "",
    invoice_terms_days: 30,
  });
  const [services, setServices] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const change = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  const toggleService = (value) =>
    setServices((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const response = await api("", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, service_categories: services }),
    });
    const data = await response.json();
    if (!response.ok) {
      setSaving(false);
      return setError(
        Object.values(data).flat().join(" ") ||
          "Could not create organisation.",
      );
    }
    setSaving(false);
    onCreated(data);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-[#0b2436]/45 p-0 sm:items-center sm:justify-center sm:p-6">
      <form
        onSubmit={submit}
        className="max-h-[92dvh] w-full overflow-y-auto bg-white p-5 shadow-2xl sm:max-w-2xl sm:rounded-xl sm:p-7"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1686a5]">
              New partner
            </p>
            <h3 className="mt-1 text-xl font-semibold">Create organisation</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {error && <p className="mt-4 text-sm text-rose-700">{error}</p>}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Organisation name">
            <input name="name" value={form.name} onChange={change} required />
          </Field>
          <Field label="Three-letter acronym">
            <input
              name="acronym"
              value={form.acronym}
              onChange={change}
              maxLength="3"
              required
            />
          </Field>
          <Field label="Billing contact">
            <input
              name="billing_contact_name"
              value={form.billing_contact_name}
              onChange={change}
            />
          </Field>
          <Field label="Billing email">
            <input
              name="billing_contact_email"
              type="email"
              value={form.billing_contact_email}
              onChange={change}
            />
          </Field>
          <Field label="Monthly organisation cap">
            <input
              name="monthly_cap"
              type="number"
              min="0"
              value={form.monthly_cap}
              onChange={change}
              required
            />
          </Field>
          <Field label="Default employee allowance">
            <input
              name="default_allowance"
              type="number"
              min="0"
              value={form.default_allowance}
              onChange={change}
              required
            />
          </Field>
          <Field label="Start date">
            <input
              name="starts_on"
              type="date"
              value={form.starts_on}
              onChange={change}
              required
            />
          </Field>
          <Field label="Invoice terms (days)">
            <input
              name="invoice_terms_days"
              type="number"
              min="0"
              value={form.invoice_terms_days}
              onChange={change}
              required
            />
          </Field>
        </div>
        <div className="mt-6 border-y border-[#e8eff4] py-4">
          <p className="text-sm font-semibold">Eligible services</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {SERVICES.map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={services.includes(value)}
                  onChange={() => toggleService(value)}
                  className="h-4 w-4 accent-[#0f708a]"
                />
                {label}
              </label>
            ))}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-slate-600"
          >
            Cancel
          </button>
          <button
            disabled={saving || services.length === 0}
            className="rounded-lg bg-[#0f708a] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create organisation"}
          </button>
        </div>
      </form>
    </div>
  );
}
function Field({ label, children }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-[#344b5d]">
      <span>{label}</span>
      {children && (
        <span className="[&>input]:w-full [&>input]:rounded-lg [&>input]:border [&>input]:border-[#ccdce6] [&>input]:px-3 [&>input]:py-2.5 [&>input]:text-sm [&>input]:font-normal [&>input]:outline-none [&>input:focus]:border-[#0f708a] [&>select]:w-full [&>select]:rounded-lg [&>select]:border [&>select]:border-[#ccdce6] [&>select]:px-3 [&>select]:py-2.5 [&>select]:text-sm [&>select]:font-normal [&>select]:outline-none [&>select:focus]:border-[#0f708a]">
          {children}
        </span>
      )}
    </label>
  );
}

export default Organisations;
