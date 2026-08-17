import { useEffect, useMemo, useState } from "react";
import { MdArrowBack } from "react-icons/md";
import { Filter, SearchNormal } from "iconsax-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Sidebar from "./Sidebar";
import ApplicationCard from "../../../Components/CareSeekers/ApplicationCard";
import ApplicationFilterPopover from "../../../Components/CareSeekers/ApplicationFilterPopover";
import { emptyApplicationFilters } from "../../../Components/CareSeekers/applicationFilterOptions";
import { statusLabel } from "../../../Components/CareSeekers/applicationUtils";
import ApplicationDetailsModal from "../../../Components/CareSeekers/ApplicationDetailsModal";
import {
  acceptApplication,
  removeApplication,
  rejectApplication,
} from "../../../Components/CareSeekers/applicationApi";
import { fetchSeekerPendingRequests } from "../../../Redux/SeekerRequest";

const filters = ["All Applications", "Accepted", "Rejected"];

const normalizedValue = (value) =>
  String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");

function matchesApplicationFilters(request, application, selected) {
  const service = normalizedValue(request.serviceCategory || request.service_category);
  const serviceAliases = {
    childcare: ["childcare", "childcare"],
    adult_senior_care: ["elderlycare", "adultseniorcare", "senioradultcare"],
    tutoring: ["tutoring"],
    housekeeping: ["housekeeping"],
  };
  if (selected.service && !serviceAliases[selected.service].includes(service)) return false;

  const distance = Number(application.providerDistanceKm ?? application.provider_distance_km);
  if (selected.location && !Number.isFinite(distance)) return false;
  if (selected.location === "near" && distance > 5) return false;
  if (selected.location === "5" && distance > 5) return false;
  if (selected.location === "10" && distance > 10) return false;

  const years = Number(application.providerYearsExperience ?? application.provider_years_of_experience ?? 0);
  if (selected.experience === "1-2" && (years < 1 || years > 2)) return false;
  if (selected.experience === "3-5" && (years < 3 || years > 5)) return false;
  if (selected.experience === "6-10" && (years < 6 || years > 10)) return false;
  if (selected.experience === "10+" && years < 10) return false;

  const rating = Number(application.providerAverageRating ?? application.provider_average_rating ?? 0);
  if (selected.rating && rating < Number(selected.rating)) return false;
  if (selected.verifiedOnly && !application.isVerified) return false;
  return true;
}

function AllApplications() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pending = [], loading, error } = useSelector((state) => state.seekerRequests || {});
  const [filter, setFilter] = useState(filters[0]);
  const [query, setQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [applicationFilters, setApplicationFilters] = useState(emptyApplicationFilters);

  useEffect(() => {
    dispatch(fetchSeekerPendingRequests());
  }, [dispatch]);

  const entries = useMemo(() => {
    const normalized = pending.flatMap((request) => (request.applications || []).map((application) => ({ request, application })));
    const search = query.trim().toLowerCase();
    return normalized.filter(({ request, application }) => {
      const matchesFilter = filter === "All Applications" || statusLabel(application.status) === filter;
      const matchesSearch = !search || `${application.providerName} ${request.title}`.toLowerCase().includes(search);
      return matchesFilter && matchesSearch && matchesApplicationFilters(request, application, applicationFilters);
    });
  }, [applicationFilters, filter, pending, query]);

  const reject = async (entry) => {
    if (!entry?.application?.id) return;
    await rejectApplication(entry.application.id);
    setSelectedEntry(null);
    dispatch(fetchSeekerPendingRequests());
  };

  const accept = async (entry) => {
    if (!entry?.application?.id) return;
    await acceptApplication(entry.application.id);
    setSelectedEntry(null);
    dispatch(fetchSeekerPendingRequests());
  };

  const remove = async (entry) => {
    if (!entry?.application?.id) return;
    await removeApplication(entry.application.id);
    dispatch(fetchSeekerPendingRequests());
  };

  return (
    <div className="min-h-screen bg-white font-sfpro tracking-normal">
      <Sidebar active="Home" mobileBottomNav hideMobileBottomNav />
      <main className="mx-auto max-w-[1120px] px-5 pb-28 pt-8 md:ml-64 md:px-10 md:pb-10 md:pt-10">
        <header className="flex items-center gap-4">
          <button type="button" onClick={() => navigate(-1)} className="grid h-12 w-12 place-items-center rounded-full bg-[#f4f7f8] text-3xl text-[#0e2f43]" aria-label="Go back"><MdArrowBack /></button>
          <h1 className="text-[22px] font-bold text-[#0e2f43]">All Applications</h1>
        </header>
        <div className="relative mt-6 flex gap-3">
          <label className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-[#555]"><SearchNormal size={24} color="#555" variant="Linear" /></span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" className="h-14 w-full rounded-xl border border-[#e1e4e6] pl-12 pr-4 text-[17px] outline-none focus:border-[#0d99c9]" />
          </label>
          <button type="button" onClick={() => setShowFilter((visible) => !visible)} className={`grid h-14 w-14 place-items-center rounded-xl border text-2xl text-[#222] ${showFilter || Object.values(applicationFilters).some(Boolean) ? "border-[#0d99c9]" : "border-[#e1e4e6]"}`} aria-label="Filter applications" aria-expanded={showFilter}><Filter size={24} color="#222" variant="Linear" /></button>
          {showFilter && <ApplicationFilterPopover filters={applicationFilters} onChange={(key, value) => setApplicationFilters((current) => ({ ...current, [key]: value }))} onClear={() => setApplicationFilters(emptyApplicationFilters)} />}
        </div>
        <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
          {filters.map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`shrink-0 rounded-full border px-5 py-2.5 text-[15px] ${filter === item ? "border-[#0d99c9] bg-[#0d99c9] text-white" : "border-[#e1e4e6] text-[#0e2f43]"}`}>{item}</button>)}
        </div>
        <div className="mt-7 space-y-4">
          {loading ? <p className="py-12 text-center text-[#8b8f94]">Loading applications…</p> : error ? <p className="py-12 text-center text-[#ff3347]">Could not load applications.</p> : entries.length ? entries.map((entry) => <ApplicationCard key={entry.application.id} application={entry.application} request={entry.request} onReject={() => reject(entry)} onRemove={() => remove(entry)} onViewDetails={() => setSelectedEntry(entry)} />) : <p className="py-12 text-center text-[#8b8f94]">No applications found.</p>}
        </div>
      </main>
      {selectedEntry && <ApplicationDetailsModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} onReject={() => { setSelectedEntry(null); dispatch(fetchSeekerPendingRequests()); }} onAccept={() => accept(selectedEntry)} />}
    </div>
  );
}

export default AllApplications;
