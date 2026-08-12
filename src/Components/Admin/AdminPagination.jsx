export default function AdminPagination({
  page,
  count,
  pageSize,
  totalPages,
  onPage,
}) {
  if (count <= pageSize) return null;

  return (
    <div className="flex items-center justify-between border-t border-[#EAECF0] px-5 py-4 text-sm font-medium text-[#344054] sm:px-6">
      <span className="text-xs text-slate-500">
        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, count)} of{" "}
        {count}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
          className="rounded-lg border border-[#D0D5DD] px-3 py-2 text-xs disabled:opacity-50"
        >
          Previous
        </button>
        <span className="min-w-[64px] text-center text-xs text-slate-500">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => onPage(page + 1)}
          className="rounded-lg border border-[#D0D5DD] px-3 py-2 text-xs disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
