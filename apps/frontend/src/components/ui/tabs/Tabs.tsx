import React, { useState } from "react";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab, className = "" }) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab || tabs[0]?.id);

  const getButtonClass = (tabId: string) =>
    activeTab === tabId
      ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
      : "text-gray-500 dark:text-gray-400";

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  const handleTabClick = (tabId: string, event: React.MouseEvent) => {
    // Previeni la propagazione dell'evento per evitare che chiuda la modale
    event.preventDefault();
    event.stopPropagation();
    setActiveTab(tabId);
  };

  return (
    <div className={className}>
      {/* Tab Navigation */}
      <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={(e) => handleTabClick(tab.id, e)}
            className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white transition-colors ${getButtonClass(
              tab.id
            )}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTabContent}
      </div>
    </div>
  );
};

export default Tabs;