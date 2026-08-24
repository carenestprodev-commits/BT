import { useState, useMemo, useEffect } from 'react';
import { FaTimes, FaDownload, FaCheckCircle } from 'react-icons/fa';
import dayjs from 'dayjs';
import { fetchWithAuth } from '../../lib/fetchWithAuth';

const normalizeExportRows = (rows) => (Array.isArray(rows) ? rows : []).map((row) => ({
  ...row,
  name: row.name ?? row.full_name ?? '',
  userType: row.userType ?? row.user_type ?? '',
  phone: row.phone ?? row.phone_number ?? '',
  onboard: row.onboard ?? row.date_joined ?? '',
  onboardDate: row.onboardDate ?? row.date_joined ?? row.onboard ?? '',
  lastLogin: row.lastLogin ?? row.last_login ?? '',
  is_verified: row.is_verified ?? row.verification_status === 'verified',
  country: row.country ?? row.location_details?.country ?? '',
  city: row.city ?? row.location_details?.city ?? '',
}));

const DataExportModal = ({ isOpen, onClose, data, exportUrl, selectedIds, activeStat }) => {
  const [format, setFormat] = useState('csv');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isPreparing, setIsPreparing] = useState(false);
  const [sourceData, setSourceData] = useState(() => normalizeExportRows(data));
  const [loadError, setLoadError] = useState('');
  const [sourceLoading, setSourceLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (!exportUrl) {
      setSourceData(normalizeExportRows(data));
      setLoadError('');
      setSourceLoading(false);
      return;
    }
    let cancelled = false;
    setLoadError('');
    setSourceLoading(true);
    fetchWithAuth(exportUrl)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.detail || 'Unable to prepare export.');
        if (!cancelled) {
          setSourceData(normalizeExportRows(Array.isArray(payload) ? payload : payload.results || []));
          setSourceLoading(false);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(error.message || 'Unable to prepare export.');
          setSourceLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [data, exportUrl, isOpen]);
  
  const columns = [
    { id: 'name', label: 'Name', default: true },
    { id: 'userType', label: 'User Type', default: true },
    { id: 'email', label: 'Email', default: true },
    { id: 'phone', label: 'Phone', default: true },
    { id: 'onboard', label: 'Joined Date', default: true },
    { id: 'lastLogin', label: 'Last Login', default: false },
    { id: 'is_verified', label: 'Verification Status', default: true },
    { id: 'subscriptionStatus', label: 'Subscription', default: false },
    { id: 'country', label: 'Country', default: true },
    { id: 'city', label: 'City', default: false },
  ];

  const [selectedColumns, setSelectedColumns] = useState(
    columns.filter(c => c.default).map(c => c.id)
  );

  const exportData = useMemo(() => {
    let filtered = [...sourceData];
    
    // Filter by selected IDs if any
    if (selectedIds && selectedIds.length > 0) {
      filtered = filtered.filter(item => selectedIds.includes(item.id));
    }
    
    // Filter by date range if specified
    if (dateRange.start) {
      const start = dayjs(dateRange.start);
      filtered = filtered.filter(item => {
        const itemDate = dayjs(item.onboardDate || item.date_joined || item.onboard);
        return itemDate.isValid() && itemDate.valueOf() >= start.valueOf();
      });
    }
    if (dateRange.end) {
        const end = dayjs(dateRange.end).endOf('day');
      filtered = filtered.filter(item => {
        const itemDate = dayjs(item.onboardDate || item.date_joined || item.onboard);
        return itemDate.isValid() && itemDate.valueOf() <= end.valueOf();
      });
    }
    
    return filtered;
  }, [sourceData, selectedIds, dateRange]);

  const toggleColumn = (id) => {
    setSelectedColumns(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    setIsPreparing(true);
    
    const filename = `carenest_${activeStat}_export_${dayjs().format('YYYY-MM-DD')}`;
    if (format === 'csv') downloadCSV(exportData, filename);
    else downloadJSON(exportData, filename);
    setIsPreparing(false);
    onClose();
  };

  const downloadCSV = (rows, filename) => {
    const selectedCols = columns.filter(c => selectedColumns.includes(c.id));
    const header = selectedCols.map(c => c.label);
    
    const csvContent = [
      header,
      ...rows.map(row => selectedCols.map(col => {
        let val = row[col.id];
        if (col.id === 'is_verified') val = val ? 'Verified' : 'Pending';
        return `"${String(val ?? '').replace(/"/g, '""')}"`;
      }))
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadJSON = (rows, filename) => {
    const selectedCols = columns.filter(c => selectedColumns.includes(c.id));
    const jsonContent = rows.map(row => {
      const item = {};
      selectedCols.forEach(col => {
        item[col.label] = row[col.id];
      });
      return item;
    });

    const blob = new Blob([JSON.stringify(jsonContent, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.json`;
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-40 font-sfpro">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 border-none">Export User Data</h3>
            <p className="text-sm text-gray-500 mt-1">
              {selectedIds?.length > 0 
                ? `Exporting ${exportData.length} selected users` 
                : `Exporting all ${exportData.length} ${activeStat} users`}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FaTimes size={20} />
          </button>
        </div>

        {loadError && <p className="mb-4 text-sm text-red-600">{loadError}</p>}

        <div className="space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">File Format</label>
            <div className="flex gap-4">
              {['csv', 'json'].map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`flex-1 py-2 px-4 rounded-md border text-sm font-medium transition-all ${
                    format === f 
                      ? 'bg-[#0b93c6] text-white border-[#0b93c6]' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-[#0b93c6] hover:text-[#0b93c6]'
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Column Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Columns to Export</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {columns.map(col => (
                <label key={col.id} className="flex items-center group cursor-pointer p-2 rounded hover:bg-slate-50 transition-colors">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${
                    selectedColumns.includes(col.id) ? 'bg-[#0b93c6] border-[#0b93c6]' : 'border-gray-300 bg-white'
                  }`}>
                    {selectedColumns.includes(col.id) && <FaCheckCircle className="text-white text-xs" />}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={selectedColumns.includes(col.id)}
                    onChange={() => toggleColumn(col.id)}
                  />
                  <span className="text-sm text-gray-700">{col.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Date Range (Joined Date)</label>
            <div className="flex gap-3 items-center">
              <input
                type="date"
                value={dateRange.start}
                onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-black bg-white focus:ring-1 focus:ring-[#0b93c6] outline-none"
                placeholder="Start Date"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-black bg-white focus:ring-1 focus:ring-[#0b93c6] outline-none"
                placeholder="End Date"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-md font-medium hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isPreparing || sourceLoading || exportData.length === 0}
            className="flex-[2] px-4 py-2.5 bg-[#0b93c6] text-white rounded-md font-medium shadow-sm hover:bg-[#0a82b0] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPreparing || sourceLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Preparing...
              </span>
            ) : (
              <>
                <FaDownload className="text-sm" />
                Export {exportData.length} Records
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataExportModal;
