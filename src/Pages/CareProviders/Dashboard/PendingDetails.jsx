import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import {
  fetchPendingRequestById,
  deletePendingRequest,
  patchPendingRequest,
} from "../../../Redux/ProviderRequest";

function PendingDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const dispatch = useDispatch();

  const locationDetails = location?.state?.details || null;

  const { currentRequest } = useSelector(
    (s) => s.providerRequests || { currentRequest: null },
  );

  // source of truth: prefer location state, then redux — no hardcoded fallback
  const source = locationDetails || currentRequest || null;

  const [summary, setSummary] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const id = params.id || params.requestId || null;
    if (!locationDetails && id) {
      dispatch(fetchPendingRequestById(id));
    }
  }, [dispatch, locationDetails, params]);

  useEffect(() => {
    if (!source) return;
    setSummary(source?.summary || source?.description?.[0] || "");
    const skillsArr = source?.skills_and_expertise || source?.skills || [];
    setSkillsInput(
      Array.isArray(skillsArr) ? skillsArr.join(", ") : skillsArr || "",
    );
  }, [source]);

  const description =
    source?.description ?? (source?.summary ? [source.summary] : []);
  const skills = source?.skills_and_expertise ?? source?.skills ?? [];
  const title = source?.title ?? source?.summary ?? "";
  const posted = source?.posted_ago || source?.posted || "";

  return (
    <div className="flex min-h-screen bg-gray-50 font-sfpro">
      <Sidebar active="Requests" />

      <div className="flex-1 md:ml-64">
        {/*
          Sticky sub-header: on mobile it sits just below the fixed Sidebar
          top navbar (~57px). On desktop top-0 is correct (no top navbar).
        */}
        <div className="sticky top-[57px] md:top-0 z-30 bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
          <button
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            ←
          </button>
          <h2 className="text-lg font-normal text-gray-500">Details</h2>
        </div>

        {/* Scrollable body */}
        <div className="px-6 py-6 md:px-8 overflow-y-auto">
          {/* Loading / empty state */}
          {!source && <p className="text-sm text-gray-400">Loading details…</p>}

          {source && (
            <div className="max-w-4xl">
              <h1 className="text-lg font-bold text-gray-900 mb-2">{title}</h1>
              {posted ? (
                <p className="text-xs text-gray-400 mb-6">{posted}</p>
              ) : null}

              {/* Description paragraphs */}
              {description.length > 0 && (
                <div className="text-gray-600 leading-relaxed space-y-4 mb-8 text-sm">
                  {description.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-normal text-gray-900 mb-3">
                    Skills and expertise
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s, i) => (
                      <span
                        key={i}
                        className="text-xs bg-gray-100 text-gray-600 rounded-full px-3 py-1 border border-gray-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Edit / Read-only controls */}
          <div className="mt-6 max-w-3xl">
            {!editMode ? (
              /* Buttons side by side on both mobile and desktop */
              <div className="flex gap-3">
                <button
                  onClick={() => setEditMode(true)}
                  className="flex-1 bg-white text-[#0093d1] py-3 rounded-md font-medium text-sm border border-[#0093d1] hover:bg-gray-50 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={async () => {
                    const id = source?.id || params.id;
                    if (!id) return alert("Missing id");
                    if (
                      !confirm(
                        "Are you sure you want to close/delete this pending request?",
                      )
                    )
                      return;
                    const res = await dispatch(deletePendingRequest(id));
                    if (res.error) {
                      alert(
                        "Delete failed: " +
                          (res.payload?.detail ||
                            JSON.stringify(res.payload) ||
                            res.error.message),
                      );
                    } else {
                      navigate("/careproviders/dashboard/requests");
                    }
                  }}
                  className="flex-1 bg-[#0093d1] text-white py-3 rounded-md font-medium text-sm hover:bg-[#007bb0] transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <label className="block text-sm font-medium text-gray-700">
                  Summary
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={5}
                  className="w-full mt-2 p-3 border border-gray-200 rounded-md text-sm dark:bg-white dark:text-black"
                />

                <label className="block text-sm font-medium text-gray-700 mt-2">
                  Skills and expertise (comma separated)
                </label>
                <input
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  className="w-full mt-2 p-2 border border-gray-200 rounded-md text-sm dark:bg-white dark:text-black"
                />

                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      const id = source?.id || params.id;
                      if (!id) return alert("Missing id");
                      const skillsArr = skillsInput
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      const res = await dispatch(
                        patchPendingRequest({ id, summary, skills: skillsArr }),
                      );
                      if (res.error) {
                        alert(
                          "Update failed: " +
                            (res.payload?.detail ||
                              JSON.stringify(res.payload) ||
                              res.error.message),
                        );
                      } else {
                        dispatch(fetchPendingRequestById(id));
                        setEditMode(false);
                      }
                    }}
                    className="flex-1 bg-white text-[#0093d1] py-3 rounded-md font-medium text-sm border border-[#0093d1] hover:bg-gray-50 transition-colors"
                  >
                    Save
                  </button>

                  <button
                    onClick={() => {
                      setSummary(
                        source?.summary || source?.description?.[0] || "",
                      );
                      const skillsArr =
                        source?.skills_and_expertise || source?.skills || [];
                      setSkillsInput(
                        Array.isArray(skillsArr)
                          ? skillsArr.join(", ")
                          : skillsArr || "",
                      );
                      setEditMode(false);
                    }}
                    className="flex-1 bg-[#f3f4f6] text-gray-700 py-3 rounded-md font-medium text-sm hover:bg-gray-200 transition-colors"
                  >
                    Cancel
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

export default PendingDetails;
