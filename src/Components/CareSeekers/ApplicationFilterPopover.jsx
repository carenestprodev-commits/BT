import { useState } from "react";
import {
  applicationFilterSections,
} from "./applicationFilterOptions";

function ApplicationFilterPopover({ filters, onChange, onClear }) {
  const [sectionKey, setSectionKey] = useState(null);
  const section = applicationFilterSections.find(({ key }) => key === sectionKey);
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="absolute right-0 top-16 z-30 w-[236px] rounded-md border border-[#e1e4e6] bg-white p-3 shadow-[0_8px_24px_rgba(15,47,67,0.12)]" role="dialog" aria-label="Filter applications">
      {section ? (
        <>
          <button type="button" onClick={() => setSectionKey(null)} className="mb-2 flex w-full items-center gap-2 border-b border-[#edf0f2] pb-2 text-left text-[15px] font-semibold text-[#222]">
            <span aria-hidden="true">‹</span>
            {section.label}
          </button>
          <div>
            {section.options.map(([value, label]) => {
              const selected = filters[section.key] === value;
              return (
                <button key={value} type="button" onClick={() => onChange(section.key, selected ? "" : value)} className={`flex w-full items-center justify-between border-b border-[#edf0f2] px-1 py-2 text-left text-[14px] ${selected ? "font-semibold text-[#0d99c9]" : "text-[#6f7378]"}`}>
                  {label}
                  {selected && <span aria-hidden="true">✓</span>}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <p className="border-b border-[#edf0f2] pb-2 text-[15px] font-semibold text-[#222]">Filter by</p>
          <div>
            {applicationFilterSections.map(({ key, label }) => (
              <button key={key} type="button" onClick={() => setSectionKey(key)} className="flex w-full items-center justify-between border-b border-[#edf0f2] px-1 py-2 text-left text-[14px] text-[#6f7378]">
                {label}
                <span aria-hidden="true" className="text-[18px] text-[#222]">›</span>
              </button>
            ))}
            <label className="flex cursor-pointer items-center gap-2 px-1 py-2 text-[14px] text-[#6f7378]">
              <input type="checkbox" checked={filters.verifiedOnly} onChange={(event) => onChange("verifiedOnly", event.target.checked)} className="h-4 w-4 accent-[#0d99c9]" />
              Verified providers
            </label>
          </div>
          {hasFilters && <button type="button" onClick={onClear} className="mt-2 text-[13px] font-semibold text-[#0d99c9]">Clear filters</button>}
        </>
      )}
    </div>
  );
}

export default ApplicationFilterPopover;
