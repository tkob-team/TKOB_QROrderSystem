import React from 'react';
import { FileText, FileSpreadsheet } from 'lucide-react';
import type { TimeRange } from '../../../model/types';

type Props = {
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
};

export function PDFExportSection({ timeRange, onTimeRangeChange, onExportPDF, onExportExcel }: Props) {
  return (
    <div className="px-6 pt-3 pb-2 border-b border-default bg-secondary">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-text-primary text-[26px] font-bold leading-tight tracking-tight">Analytics</h2>
          <p className="text-text-secondary text-sm">Detailed insights and performance metrics</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            className="px-4 py-2.5 h-10 border border-default bg-secondary text-text-primary cursor-pointer focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all text-sm font-medium rounded-lg mt-0.5"
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value as TimeRange)}
          >
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 3 months</option>
            <option>Last year</option>
            <option>Custom range</option>
          </select>

          <button
            onClick={onExportPDF}
            className="flex items-center gap-2 px-4 py-2 h-10 bg-secondary hover:bg-elevated border-2 border-default text-text-secondary transition-all text-sm font-semibold rounded-lg"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </button>

          <button
            onClick={onExportExcel}
            className="flex items-center gap-2 px-4 py-2 h-10 bg-secondary hover:bg-elevated border-2 border-default text-text-secondary transition-all text-sm font-semibold rounded-lg"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>
    </div>
  );
}
