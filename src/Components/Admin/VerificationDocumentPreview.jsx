import { BASE_URL } from "../../Redux/config";

const resolveUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return url.startsWith("/") ? `${BASE_URL}${url}` : `${BASE_URL}/${url}`;
};

export default function VerificationDocumentPreview({ url, label = "Government ID" }) {
  if (!url) return null;
  const resolvedUrl = resolveUrl(url);
  const isImage = /\.(png|jpe?g|webp|gif)(\?|$)/i.test(resolvedUrl);

  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
      {isImage ? (
        <img src={resolvedUrl} alt={label} className="max-h-60 w-full object-contain" />
      ) : (
        <iframe title={label} src={resolvedUrl} className="h-60 w-full" />
      )}
      <a href={resolvedUrl} target="_blank" rel="noreferrer" className="block border-t border-slate-200 px-3 py-2 text-xs font-medium text-[#0b93c6] hover:underline">
        Open full document
      </a>
    </div>
  );
}
