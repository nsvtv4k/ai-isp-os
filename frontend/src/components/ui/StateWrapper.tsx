import React from 'react';
import { AlertTriangle, ShieldAlert, RefreshCw, Clock, Inbox, Loader2 } from 'lucide-react';

export interface StateWrapperProps {
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  error?: string | null;
  correlationId?: string;
  onRetry?: () => void;
  isPermissionDenied?: boolean;
  permissionRequired?: string;
  pendingCommand?: {
    status: 'queued' | 'sent' | 'verifying' | 'success' | 'failed';
    action: string;
    correlationId?: string;
  } | null;
  lastUpdated?: Date | string | null;
  onRefresh?: () => void;
  children: React.ReactNode;
}

export const StateWrapper: React.FC<StateWrapperProps> = ({
  isLoading,
  isEmpty,
  emptyTitle = 'No data available',
  emptyMessage = 'There are currently no records matching this view.',
  emptyActionLabel,
  onEmptyAction,
  error,
  correlationId,
  onRetry,
  isPermissionDenied,
  permissionRequired,
  pendingCommand,
  lastUpdated,
  onRefresh,
  children,
}) => {
  if (isLoading) {
    return (
      <div className="w-full p-12 flex flex-col items-center justify-center min-h-[300px] space-y-4 bg-[#111827] border border-slate-800 rounded-2xl shadow-xl">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
        <p className="text-slate-400 text-sm font-medium animate-pulse">Synchronizing real-time network telemetry...</p>
      </div>
    );
  }

  if (isPermissionDenied) {
    return (
      <div className="w-full p-10 flex flex-col items-center justify-center min-h-[320px] bg-[#111827] border border-amber-500/30 rounded-2xl text-center space-y-3 shadow-xl">
        <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-white">Access Restricted</h3>
        <p className="text-sm text-slate-400 max-w-md">
          Your role does not have authorization to view or execute this resource.
          {permissionRequired && <span className="block mt-1 font-mono text-xs text-amber-400">Required: {permissionRequired}</span>}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-10 flex flex-col items-center justify-center min-h-[320px] bg-[#111827] border border-rose-500/30 rounded-2xl text-center space-y-3 shadow-xl">
        <div className="w-12 h-12 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-white">Network Telemetry Notice</h3>
        <p className="text-sm text-slate-400 max-w-md">{error}</p>
        {correlationId && (
          <p className="text-xs font-mono text-slate-500">Ref ID: {correlationId}</p>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 inline-flex items-center space-x-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-rose-600/20"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Request</span>
          </button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="w-full p-14 flex flex-col items-center justify-center min-h-[320px] bg-[#111827] border border-slate-800 rounded-2xl text-center space-y-3 shadow-xl">
        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-white">{emptyTitle}</h3>
        <p className="text-sm text-slate-400 max-w-md">{emptyMessage}</p>
        {emptyActionLabel && onEmptyAction && (
          <button
            onClick={onEmptyAction}
            className="mt-4 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-sky-600/30"
          >
            {emptyActionLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {pendingCommand && (
        <div className="mb-4 p-4 bg-sky-500/10 border border-sky-500/30 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-5 h-5 text-sky-400 animate-spin" />
            <div>
              <p className="text-sm font-bold text-white">
                Command: <span className="font-mono text-sky-300">{pendingCommand.action}</span>
              </p>
              <p className="text-xs text-slate-400">
                Status: <span className="capitalize font-bold text-sky-400">{pendingCommand.status}</span>
              </p>
            </div>
          </div>
          {pendingCommand.correlationId && (
            <span className="text-xs font-mono text-slate-500">{pendingCommand.correlationId}</span>
          )}
        </div>
      )}

      {lastUpdated && (
        <div className="flex items-center justify-end space-x-2 text-xs text-slate-400 mb-3 font-mono">
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          <span>Synchronized: {new Date(lastUpdated).toLocaleTimeString()}</span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1 hover:text-white text-slate-400 transition"
              title="Refresh live data"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {children}
    </div>
  );
};
