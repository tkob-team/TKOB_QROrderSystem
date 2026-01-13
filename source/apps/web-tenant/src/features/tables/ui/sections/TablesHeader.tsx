'use client';

import React from 'react';
import { Download, Plus, RefreshCcw } from 'lucide-react';
import type { TablesHeaderProps } from '../../domain/types';

export function TablesHeader({
  hasTables,
  isBulkRegenLoading,
  isDownloadingAll,
  isCreating,
  onOpenBulkRegen,
  onDownloadAll,
  onAddTable,
}: TablesHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-text-primary text-[clamp(20px,5vw,28px)] font-bold leading-tight tracking-tight">
          Tables & QR Codes
        </h2>
        <p className="text-text-secondary text-[clamp(13px,4vw,15px)]">
          Manage your restaurant tables and generate QR codes
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto">
        {hasTables && (
          <>
            <button
              onClick={onOpenBulkRegen}
              disabled={isBulkRegenLoading}
              className="flex items-center justify-center md:justify-start gap-2 px-4 sm:px-5 py-3 h-12 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-500 text-gray-600 hover:text-blue-500 transition-all flex-1 md:flex-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rounded-lg text-[clamp(13px,4vw,15px)] font-semibold"
            >
              {isBulkRegenLoading ? (
                <>
                  <RefreshCcw className="w-4 sm:w-5 h-4 sm:h-5 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCcw className="w-4 sm:w-5 h-4 sm:h-5" />
                  <span className="hidden sm:inline">Regenerate All QR Codes</span>
                  <span className="sm:hidden">Regenerate</span>
                </>
              )}
            </button>
            <button
              onClick={onDownloadAll}
              disabled={isDownloadingAll}
              className="flex items-center justify-center md:justify-start gap-2 px-4 sm:px-5 py-3 h-12 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-emerald-500 text-gray-600 hover:text-emerald-500 transition-all flex-1 md:flex-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rounded-lg text-[clamp(13px,4vw,15px)] font-semibold"
            >
              {isDownloadingAll ? (
                <>
                  <RefreshCcw className="w-4 sm:w-5 h-4 sm:h-5 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 sm:w-5 h-4 sm:h-5" />
                  <span className="hidden sm:inline">Download All QR Codes</span>
                  <span className="sm:hidden">Download</span>
                </>
              )}
            </button>
          </>
        )}
        <button
          onClick={onAddTable}
          disabled={isCreating}
          className="flex items-center justify-center md:justify-start gap-2 px-4 sm:px-5 py-3 h-12 bg-emerald-500 hover:bg-emerald-600 text-white transition-all flex-1 md:flex-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rounded-lg text-[clamp(13px,4vw,15px)] font-semibold shadow-md hover:shadow-lg"
        >
          {isCreating ? (
            <>
              <RefreshCcw className="w-4 sm:w-5 h-4 sm:h-5 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="w-4 sm:w-5 h-4 sm:h-5" />
              Add Table
            </>
          )}
        </button>
      </div>
    </div>
  );
}
