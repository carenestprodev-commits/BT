import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { uploadVerificationId } from "../../../Redux/Verification";
import { validateFileSize } from "../../../lib/constants";

function CertificateUploadGate() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const { uploadLoading } = useSelector((state) => state.verification || {});

  const handleFilePick = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const error = validateFileSize(file);
    if (error) {
      alert(error);
      event.target.value = "";
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    const action = await dispatch(
      uploadVerificationId({ file: selectedFile, type: "certificate" }),
    );
    if (action?.error) {
      const errorText =
        action?.payload?.error ||
        action?.payload?.detail ||
        action?.error?.message ||
        "Certificate upload failed.";
      alert(errorText);
      return;
    }
    navigate("/careproviders/dashboard/home", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sfpro">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Upload Training Certificate
        </h1>
        <p className="mt-3 text-gray-600">
          Upload your care provider training certificate to continue to your
          dashboard.
        </p>

        <div className="mt-6 border border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
          {!selectedFile ? (
            <>
              <button
                className="px-4 py-2 rounded-lg bg-[#0093d1] text-white hover:bg-[#007bb0]"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose Certificate
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={handleFilePick}
              />
              <p className="mt-2 text-xs text-gray-500">
                Supported: JPG, PNG, PDF
              </p>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-gray-800 font-medium">{selectedFile.name}</p>
              <div className="flex gap-3 justify-center">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                  onClick={() => setSelectedFile(null)}
                  disabled={uploadLoading}
                >
                  Remove
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-[#0093d1] text-white hover:bg-[#007bb0] disabled:opacity-60"
                  onClick={handleUpload}
                  disabled={uploadLoading}
                >
                  {uploadLoading ? "Uploading..." : "Upload Certificate"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CertificateUploadGate;
