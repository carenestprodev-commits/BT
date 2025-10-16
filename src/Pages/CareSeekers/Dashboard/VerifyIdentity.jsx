import { useRef, useState } from "react";
import Sidebar from "./Sidebar";
import UploadIcon from "../../../../public/upload.svg"; 
import { useDispatch } from 'react-redux'
import { uploadVerificationId } from '../../../Redux/Verification'


function VerifyIdentity() {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const dispatch = useDispatch()
  const [uploading, setUploading] = useState(false)

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please choose a file first')
      return
    }
    setUploading(true)
    try {
      const res = await dispatch(uploadVerificationId(selectedFile))
      if (res && res.payload && res.payload.message) {
        alert(res.payload.message)
        // clear selected file on success
        handleRemoveFile()
      } else if (res && res.error && res.error.message) {
        alert(res.error.message)
      } else {
        alert('Upload completed')
        handleRemoveFile()
      }
    } catch (err) {
      console.error(err)
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  // (no extra helper needed)

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar active="Setting" />
      <div className="flex-1 font-sfpro px-8 py-8 ml-64">
        <div className="mb-8 flex items-center">
          <button className="mr-4 text-gray-500 hover:text-gray-700 text-2xl font-bold" onClick={() => window.history.back()}>
            ←
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">Verify my Identity</h2>
        </div>
        <div className="max-w-xl">
          <div className="mb-4 text-gray-700 font-medium">Upload Government ID</div>
          <div className="w-full mx-auto bg-white border border-gray-200 rounded-lg flex flex-col items-center justify-center py-16">
            <img src={UploadIcon} alt="Upload Icon" className="mb-4 h-20" />
            {!selectedFile ? (
              <>
                <button
                  className=" text-[#0d99c9] px-6 py-2 rounded text-2xl mb-3 hover:bg-[#007bb0] hover:text-white"
                  onClick={() => fileInputRef.current.click()}
                >
                  Upload File
                </button>
                <input
                  type="file"
                  accept=".jpg,.png"
                  style={{ display: "none" }}
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <div className="text-gray-400 text-sm text-center">Supported format: jpg, png<br />Maximum Size: 3MB</div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="text-[#0d99c9] font-semibold text-lg mb-2">{selectedFile.name}</div>
                {selectedFile && (
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    className="max-h-48 max-w-xs rounded-lg border border-gray-200 mb-2"
                  />
                )}
                <div className="flex gap-2">
                  <button
                    className="bg-red-100 text-red-600 px-4 py-1 rounded font-medium hover:bg-red-200"
                    onClick={handleRemoveFile}
                  >
                    Remove
                  </button>
                    <button
                    className="bg-red-100 text-green-600 px-4 py-1 rounded font-medium hover:bg-red-200 disabled:opacity-50"
                    onClick={handleUpload}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
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
