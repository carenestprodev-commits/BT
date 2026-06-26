import { useRef, useState } from "react";
import Sidebar from "./Sidebar";
import UploadIcon from "../../../../public/upload.svg";
import { useDispatch } from "react-redux";
import { uploadVerificationId } from "../../../Redux/Verification";
import { MAX_FILE_SIZE } from "../../../lib/constants";

function VerifyIdentity() {
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [selectedFileSelf, setSelectedFileSelf] = useState(null);
  const [selectedFileCertificate, setSelectedFileCertificate] = useState(null);
  const fileInputRefId = useRef();
  const fileInputRefSelf = useRef();
  const fileInputRefCertificate = useRef();

  const handleFileChange = (e, target = "id") => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      alert("File must be 10MB or smaller.");
      e.target.value = "";
      return;
    }
    if (target === "id") setSelectedFileId(file);
    else if (target === "self") setSelectedFileSelf(file);
    else setSelectedFileCertificate(file);
  };

  const handleRemoveFile = (target = "id") => {
    if (target === "id") {
      setSelectedFileId(null);
      if (fileInputRefId.current) fileInputRefId.current.value = "";
    } else {
      if (target === "self") {
        setSelectedFileSelf(null);
        if (fileInputRefSelf.current) fileInputRefSelf.current.value = "";
      } else {
        setSelectedFileCertificate(null);
        if (fileInputRefCertificate.current) {
          fileInputRefCertificate.current.value = "";
        }
      }
    }
  };

  const dispatch = useDispatch();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (target = "id") => {
    const file =
      target === "id"
        ? selectedFileId
        : target === "self"
          ? selectedFileSelf
          : selectedFileCertificate;
    if (!file) {
      alert("Please choose a file first");
      return;
    }
    setUploading(true);
    try {
      const res = await dispatch(
        uploadVerificationId({
          file,
          type:
            target === "id"
              ? "id"
              : target === "self"
                ? "image"
                : "certificate",
        })
      );
      if (res && res.payload && res.payload.message) {
        alert(res.payload.message);
        // clear selected file on success
        handleRemoveFile(target);
      } else if (res && res.error && res.error.message) {
        alert(res.error.message);
      } else {
        alert("Upload completed");
        handleRemoveFile(target);
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // (no extra helper needed)

  return (
    <div className="flex min-h-screen bg-white font-sfpro">
      <Sidebar active="Setting" />
      <div className="flex-1 font-sfpro px-4 md:px-8 py-8 md:ml-64">
        <div className="mb-8 flex items-center">
          <button
            className="mr-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            onClick={() => window.history.back()}
          >
            ←
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">
            Verify my Identity
          </h2>
        </div>
        <div className="max-w-xl">
          <div className="mb-4 text-gray-700 font-medium">
            Upload Government ID
          </div>
          <div className="w-full mx-auto bg-white border border-gray-200 rounded-lg flex flex-col items-center justify-center py-16">
            <img src={UploadIcon} alt="Upload Icon" className="mb-4 h-20" />
            {!selectedFileId ? (
              <>
                <button
                  className=" text-[#0d99c9] px-6 py-2 rounded text-2xl mb-3 hover:bg-[#007bb0] hover:text-white"
                  onClick={() => fileInputRefId.current.click()}
                >
                  Upload File
                </button>
                <input
                  type="file"
                  accept=".jpg,.png"
                  style={{ display: "none" }}
                  ref={fileInputRefId}
                  onChange={(e) => handleFileChange(e, "id")}
                />
                <div className="text-gray-400 text-sm text-center">
                  Supported format: jpg, png
                  <br />
                  Maximum Size: 10MB
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="text-[#0d99c9] font-semibold text-lg mb-2">
                  {selectedFileId.name}
                </div>
                {selectedFileId && (
                  <img
                    src={URL.createObjectURL(selectedFileId)}
                    alt="Preview"
                    className="max-h-48 max-w-xs rounded-lg border border-gray-200 mb-2"
                  />
                )}
                <div className="flex gap-2">
                  <button
                    className="bg-red-100 text-red-600 px-4 py-1 rounded font-medium hover:bg-red-200"
                    onClick={() => handleRemoveFile("id")}
                  >
                    Remove
                  </button>
                  <button
                    className="bg-red-100 text-green-600 px-4 py-1 rounded font-medium hover:bg-red-200 disabled:opacity-50"
                    onClick={() => handleUpload("id")}
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-xl">
          <div className="mb-4 text-gray-700 font-medium mt-10">
            Upload a picture of yourself
          </div>
          <div className="w-full mx-auto bg-white border border-gray-200 rounded-lg flex flex-col items-center justify-center py-16">
            <img src={UploadIcon} alt="Upload Icon" className="mb-4 h-20" />
            {!selectedFileSelf ? (
              <>
                <button
                  className=" text-[#0d99c9] px-6 py-2 rounded text-2xl mb-3 hover:bg-[#007bb0] hover:text-white"
                  onClick={() => fileInputRefSelf.current.click()}
                >
                  Upload File
                </button>
                <input
                  type="file"
                  accept=".jpg,.png"
                  style={{ display: "none" }}
                  ref={fileInputRefSelf}
                  onChange={(e) => handleFileChange(e, "self")}
                />
                <div className="text-gray-400 text-sm text-center">
                  Supported format: jpg, png
                  <br />
                  Maximum Size: 10MB
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="text-[#0d99c9] font-semibold text-lg mb-2">
                  {selectedFileSelf.name}
                </div>
                {selectedFileSelf && (
                  <img
                    src={URL.createObjectURL(selectedFileSelf)}
                    alt="Preview"
                    className="max-h-48 max-w-xs rounded-lg border border-gray-200 mb-2"
                  />
                )}
                <div className="flex gap-2">
                  <button
                    className="bg-red-100 text-red-600 px-4 py-1 rounded font-medium hover:bg-red-200"
                    onClick={() => handleRemoveFile("self")}
                  >
                    Remove
                  </button>
                  <button
                    className="bg-red-100 text-green-600 px-4 py-1 rounded font-medium hover:bg-red-200 disabled:opacity-50"
                    onClick={() => handleUpload("self")}
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-xl mt-10">
          <div className="mb-4 text-gray-700 font-medium">
            Upload Training Certificate
          </div>
          <div className="w-full mx-auto bg-white border border-gray-200 rounded-lg flex flex-col items-center justify-center py-16">
            <img src={UploadIcon} alt="Upload Icon" className="mb-4 h-20" />
            {!selectedFileCertificate ? (
              <>
                <button
                  className=" text-[#0d99c9] px-6 py-2 rounded text-2xl mb-3 hover:bg-[#007bb0] hover:text-white"
                  onClick={() => fileInputRefCertificate.current.click()}
                >
                  Upload File
                </button>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  style={{ display: "none" }}
                  ref={fileInputRefCertificate}
                  onChange={(e) => handleFileChange(e, "certificate")}
                />
                <div className="text-gray-400 text-sm text-center">
                  Supported format: jpg, png, pdf
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="text-[#0d99c9] font-semibold text-lg mb-2">
                  {selectedFileCertificate.name}
                </div>
                <div className="flex gap-2">
                  <button
                    className="bg-red-100 text-red-600 px-4 py-1 rounded font-medium hover:bg-red-200"
                    onClick={() => handleRemoveFile("certificate")}
                  >
                    Remove
                  </button>
                  <button
                    className="bg-red-100 text-green-600 px-4 py-1 rounded font-medium hover:bg-red-200 disabled:opacity-50"
                    onClick={() => handleUpload("certificate")}
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyIdentity;
