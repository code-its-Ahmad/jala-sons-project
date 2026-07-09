'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab: controlledTab, onChange, className }: TabsProps) {
  const [internalTab, setInternalTab] = useState(tabs[0]?.id || '');
  const activeTab = controlledTab ?? internalTab;

  function handleTabClick(tabId: string) {
    if (!controlledTab) setInternalTab(tabId);
    onChange?.(tabId);
  }

  return (
    <div className={cn('flex gap-1 bg-navy-light rounded-xl p-1 border border-navy-border overflow-x-auto scrollbar-hide', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={cn(
            'relative px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
            activeTab === tab.id ? 'text-white' : 'text-muted hover:text-secondary-text',
          )}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute inset-0 bg-primary rounded-lg"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded-full',
                activeTab === tab.id ? 'bg-white/20' : 'bg-navy-border',
              )}>
                {tab.count}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
