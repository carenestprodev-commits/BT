import { useMemo, useState, useEffect, useRef } from "react";
import {
  FaSearch,
  FaDownload,
  FaTrashAlt,
  FaEdit,
  FaChevronDown,
} from "react-icons/fa";
import CubeIcon from "../../../public/3dcube.svg?react";
import CubeIconGreen from "../../../public/3dcubeGreen.svg?react";
import CubeIconPink from "../../../public/3dcubePink.svg?react";
import CubeIconOrange from "../../../public/3dcubeOrange.svg?react";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminStats,
  fetchAllUsers,
  fetchUserById,
  deleteUser,
  suspendUser,
  activateUser,
} from "../../Redux/AdminUsers";

function Users() {
  const dispatch = useDispatch();
  const { stats, users } = useSelector(
    (s) => s.adminUsers || { stats: {}, users: [] }
  );
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");
  const [sortBy, setSortBy] = useState({ key: "onboard", dir: "desc" });

  const [activeStat, setActiveStat] = useState("all");
  const [editRow, setEditRow] = useState(null);
  const [deleteRow, setDeleteRow] = useState(null);
  const [alert, setAlert] = useState(null); // { type: 'success'|'error', text }
  const alertTimerRef = useRef(null);

  useEffect(() => {
    dispatch(fetchAdminStats());
    dispatch(fetchAllUsers());
  }, [dispatch]);

  // populate editRow when currentUser is fetched
  const { currentUser } = useSelector(
    (s) => s.adminUsers || { currentUser: null }
  );

  useEffect(() => {
    // when currentUser is loaded populate editRow
    if (currentUser) {
      const u = currentUser;
      setEditRow({
        id: u.id,
        name: u.full_name || `User ${u.id}`,
        userType: u.user_type === "provider" ? "Care Provider" : "Care seeker",
        email: u.email,
        phone: u.phone_number || "",
        onboard: u.date_joined ? dayjs(u.date_joined).format("DD-MM-YYYY") : "",
        lastLogin: u.last_login ? dayjs(u.last_login).format("DD-MM-YYYY") : "",
        avatar: `/profilepic (1).png`,
        requestHistory: u.request_count ?? 0,
        requestsMade: u.request_count ?? 0,
        country: u.location_details?.country || "",
        city: u.location_details?.city || "",
        nationality: u.location_details?.nationality || "",
        subscriptionStatus:
          u.subscription_status || (u.is_active ? "Active" : "Inactive"),
        is_suspend: u.is_suspend ?? false,
        earnings: u.earnings || "-",
      });
    }
  }, [currentUser]);

  useEffect(() => {
    // Map backend users into the shape expected by the table
    if (Array.isArray(users)) {
      const mapped = users.map((u) => ({
        id: u.id,
        name: u.full_name || `User ${u.id}`,
        userType: u.user_type === "provider" ? "Care Provider" : "Care seeker",
        email: u.email,
        phone: u.phone_number || "",
        onboard: u.date_joined ? dayjs(u.date_joined).format("DD-MM-YYYY") : "",
        lastLogin: u.last_login ? dayjs(u.last_login).format("DD-MM-YYYY") : "",
        avatar: `/profilepic (1).png`,
        requestHistory: 0,
        requestsMade: 0,
        country: "",
        city: "",
        nationality: "",
        subscriptionStatus: u.is_active ? "Active" : "Inactive",
        earnings: "-",
      }));
      setRows(mapped);
    }
  }, [users]);

  const statsCounts = useMemo(
    () => ({
      users: stats?.total_users ?? 0,
      providers: stats?.total_providers ?? 0,
      seekers: stats?.total_seekers ?? 0,
      signups: stats?.new_sign_ups ?? 0,
    }),
    [stats]
  );

  const statsConfig = [
    { key: "all", label: "Users", value: statsCounts.users, icon: CubeIcon },
    {
      key: "providers",
      label: "Care Providers",
      value: statsCounts.providers,
      icon: CubeIconGreen,
    },
    {
      key: "seekers",
      label: "Care Seekers",
      value: statsCounts.seekers,
      icon: CubeIconPink,
    },
    {
      key: "signups",
      label: "New Sign Ups",
      value: statsCounts.signups,
      icon: CubeIconOrange,
    },
  ];

  const filtered = useMemo(() => {
    let data = [...rows];

    // Apply stat filter
    if (activeStat === "providers")
      data = data.filter((r) => r.userType === "Care Provider");
    if (activeStat === "seekers")
      data = data.filter((r) => r.userType === "Care seeker");
    if (query.trim()) {
      const q = query.toLowerCase();
      data = data.filter(
        (r) =>
          r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
      );
    }
    if (locationFilter !== "All") {
      // demo: filter by fake "location" stored in email domain (not real) - placeholder
      data = data.filter((r) => r.email.includes(locationFilter.toLowerCase()));
    }

    data.sort((a, b) => {
      const k = sortBy.key;
      let av = a[k];
      let bv = b[k];
      if (k === "onboard" || k === "lastLogin") {
        av = dayjs(a[k], "DD-MM-YYYY").toDate();
        bv = dayjs(b[k], "DD-MM-YYYY").toDate();
      }
      if (av < bv) return sortBy.dir === "asc" ? -1 : 1;
      if (av > bv) return sortBy.dir === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [rows, query, locationFilter, sortBy, activeStat]);

  function toggleSort(key) {
    setSortBy((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  }

  function downloadCSV() {
    const csv = [
      ["Name", "User Type", "Email", "Phone", "Onboarding Date", "Last Login"],
      ...filtered.map((r) => [
        r.name,
        r.userType,
        r.email,
        r.phone,
        r.onboard,
        r.lastLogin,
      ]),
    ]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-4 sm:p-6 text-black bg-white font-sfpro">
      {/* success/error alert */}
      {alert && (
        <div
          className={`mb-4 px-4 py-3 rounded-md ${
            alert.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
          role="alert"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="text-sm">{alert.text}</div>
            <button
              onClick={() => {
                setAlert(null);
                if (alertTimerRef.current) {
                  clearTimeout(alertTimerRef.current);
                  alertTimerRef.current = null;
                }
              }}
              className="text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statsConfig.map((s) => {
          const isActive = activeStat === s.key;
          return (
            <div
              key={s.key}
              onClick={() => setActiveStat(s.key)}
              className={`p-4 rounded-lg cursor-pointer flex flex-col justify-between ${
                isActive ? "bg-[#0e2f43] text-white" : "bg-white text-black"
              } border`}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-start">
                  <div
                    className={`w-8 h-8 flex items-center justify-center mb-2 rounded-full ${
                      isActive ? "bg-white/10" : "bg-slate-100"
                    }`}
                  >
                    {(() => {
                      const Icon = s.icon || CubeIcon;
                      return (
                        <Icon
                          className={`w-5 h-5 ${
                            isActive ? "text-white" : "text-black"
                          }`}
                        />
                      );
                    })()}
                  </div>
                  <div className="text-sm font-medium">{s.label}</div>
                </div>
                <div
                  className={`ml-auto text-2xl font-semibold ${
                    isActive ? "text-white" : "text-black"
                  }`}
                >
                  {s.value.toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Edit / Details Modal */}
      {editRow && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setEditRow(null)}
          />
          <div className="relative bg-white w-[380px] rounded-lg shadow-lg p-6 z-50 max-h-[80vh] flex flex-col">
            <button
              className="absolute right-3 top-3 text-slate-500 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center"
              onClick={() => setEditRow(null)}
            >
              ✕
            </button>
            <h3 className="text-lg font-medium mb-4">Details</h3>
            <div className="space-y-3 text-sm text-slate-700 overflow-y-auto flex-1 pr-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-500">Name</span>
                <span className="text-right">{editRow.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-500">Phone Number</span>
                <span className="text-right">{editRow.phone}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-500">Email</span>
                <span className="text-right">{editRow.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-500">onboarding Date</span>
                <span className="text-right">{editRow.onboard}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-500">Request history</span>
                <span className="text-right">{editRow.requestHistory}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-500">No of requests made</span>
                <span className="text-right">{editRow.requestsMade}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-500">Country</span>
                <span className="text-right">{editRow.country}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-500">City</span>
                <span className="text-right">{editRow.city}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-500">Nationality</span>
                <span className="text-right">{editRow.nationality}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-500">Subscription status</span>
                <span className="text-right">{editRow.subscriptionStatus}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-500">Earnings</span>
                <span className="text-right">{editRow.earnings}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">last login</span>
                <span className="text-right">{editRow.lastLogin}</span>
              </div>
            </div>

            <div className="mt-4">
              <button className="w-full bg-[#0b93c6] text-white py-2 rounded-md mb-3">
                Message
              </button>
              <button
                className="w-full border border-[#0b93c6] text-[#0b93c6] py-2 rounded-md"
                onClick={async () => {
                  if (!editRow?.id) return;
                  try {
                    if (editRow.is_suspend) {
                      const payload = await dispatch(
                        activateUser(editRow.id)
                      ).unwrap();
                      const message = payload?.data?.status || "User activated";
                      // update local rows to reflect activation
                      setRows((prev) =>
                        prev.map((r) =>
                          r.id === editRow.id
                            ? { ...r, subscriptionStatus: "Active" }
                            : r
                        )
                      );
                      setEditRow(null);
                      if (alertTimerRef.current) {
                        clearTimeout(alertTimerRef.current);
                        alertTimerRef.current = null;
                      }
                      setAlert({ type: "success", text: message });
                      alertTimerRef.current = setTimeout(
                        () => setAlert(null),
                        3000
                      );
                    } else {
                      const payload = await dispatch(
                        suspendUser(editRow.id)
                      ).unwrap();
                      const message = payload?.data?.status || "User suspended";
                      // update local rows to reflect suspension
                      setRows((prev) =>
                        prev.map((r) =>
                          r.id === editRow.id
                            ? { ...r, subscriptionStatus: "Suspended" }
                            : r
                        )
                      );
                      setEditRow(null);
                      if (alertTimerRef.current) {
                        clearTimeout(alertTimerRef.current);
                        alertTimerRef.current = null;
                      }
                      setAlert({ type: "success", text: message });
                      alertTimerRef.current = setTimeout(
                        () => setAlert(null),
                        3000
                      );
                    }
                  } catch (e) {
                    console.error("Action failed", e);
                    if (alertTimerRef.current) {
                      clearTimeout(alertTimerRef.current);
                      alertTimerRef.current = null;
                    }
                    setAlert({
                      type: "error",
                      text: "Failed to update user status",
                    });
                    alertTimerRef.current = setTimeout(
                      () => setAlert(null),
                      3000
                    );
                  }
                }}
              >
                {editRow.is_suspend ? "Activate" : "Suspend"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setDeleteRow(null)}
          />
          <div className="relative bg-white w-[320px] rounded-lg shadow-lg p-5 z-50 text-center">
            <button
              className="absolute right-3 top-3 text-slate-400 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center"
              onClick={() => setDeleteRow(null)}
            >
              ✕
            </button>
            <h4 className="text-lg font-medium mb-2">Remove User</h4>
            <p className="text-sm text-slate-600 mb-4">
              Are you sure you want to remove this user?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md"
                onClick={async () => {
                  // call delete API via redux thunk
                  try {
                    await dispatch(deleteUser(deleteRow.id)).unwrap();
                    // on success remove local row
                    setRows(rows.filter((x) => x.id !== deleteRow.id));
                  } catch (e) {
                    console.error("Delete failed", e);
                  } finally {
                    setDeleteRow(null);
                  }
                }}
              >
                Delete
              </button>
              <button
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md"
                onClick={() => setDeleteRow(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-4">
        <div className="flex-1 w-full">
          <div className="flex items-center bg-white rounded-md px-3 py-2 shadow-sm text-black">
            <FaSearch className="text-slate-400 mr-2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search for users"
              className="outline-none w-full text-sm bg-white text-black"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-3 md:mt-0">
          <div className="relative">
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="appearance-none px-4 py-2 border rounded-md text-sm bg-white text-black pr-8"
            >
              <option value="All">Filter by Location</option>
              <option value="olivia">Lagos</option>
              <option value="phoenix">Abuja</option>
            </select>
            <FaChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <button
            onClick={downloadCSV}
            className="px-3 py-2 border rounded-md flex items-center justify-center"
            aria-label="download"
          >
            <FaDownload className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-md shadow-sm overflow-x-auto text-black">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs">
            <tr>
              <th className="p-3">
                <input type="checkbox" />
              </th>
              <th
                className="p-3 text-left cursor-pointer"
                onClick={() => toggleSort("name")}
              >
                Name
              </th>
              <th className="p-3 text-left">User Type</th>
              <th className="p-3 text-left">Email address</th>
              <th className="p-3 text-left">Phone Number</th>
              <th
                className="p-3 text-left cursor-pointer"
                onClick={() => toggleSort("onboard")}
              >
                onboarding Date
              </th>
              <th
                className="p-3 text-left cursor-pointer"
                onClick={() => toggleSort("lastLogin")}
              >
                last login
              </th>
              <th className="p-3"> </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.id}
                className="border-b last:border-b-0 hover:bg-slate-50"
              >
                <td className="p-3">
                  <input type="checkbox" />
                </td>
                <td className="p-3 flex items-center gap-3">
                  <img
                    src={r.avatar}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium">{r.name}</div>
                  </div>
                </td>
                <td className="p-3">{r.userType}</td>
                <td className="p-3 text-slate-600">{r.email}</td>
                <td className="p-3">{r.phone}</td>
                <td className="p-3">{r.onboard}</td>
                <td className="p-3">{r.lastLogin}</td>
                <td className="p-3 flex items-center justify-end gap-3 text-slate-500">
                  <button title="delete" onClick={() => setDeleteRow(r)}>
                    <FaTrashAlt />
                  </button>
                  <button
                    title="edit"
                    onClick={() => {
                      // open modal immediately and fetch user data
                      setEditRow({ id: r.id, name: "Loading..." });
                      dispatch(fetchUserById(r.id));
                    }}
                  >
                    <FaEdit />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-400">
                  No results
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Users;
