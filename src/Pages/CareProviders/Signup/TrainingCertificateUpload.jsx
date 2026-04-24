function TrainingCertificateUpload({ file, onChange, error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Training certificate <span className="text-red-600">*</span>
      </label>
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="block w-full rounded-md border border-dashed border-gray-300 bg-white p-3 text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-[#0093d1] file:px-4 file:py-2 file:text-white hover:file:bg-[#007bb0]"
      />
      <p className="mt-2 text-xs text-gray-500">PDF, JPG or PNG.</p>
      {file && (
        <p className="mt-2 truncate text-sm text-gray-700">
          Selected: {file.name}
        </p>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default TrainingCertificateUpload;
