import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`flex border-b border-slate-800 space-x-1 overflow-x-auto bg-[#0E172A] px-2 rounded-t-[10px] ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              isActive
                ? 'border-[#1677FF] text-sky-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-white hover:border-slate-700/80'
            }`}
          >
            {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`px-1.5 py-0.5 text-xs rounded-full ${
                  isActive ? 'bg-sky-500/15 text-sky-400 font-bold' : 'bg-[#F1F5F9] text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
