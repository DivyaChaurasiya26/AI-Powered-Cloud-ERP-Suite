import { ReactNode, useState } from "react";

interface TabsProps {
  tabs: { key: string; label: string; content: ReactNode }[];
  defaultTab?: string;
}

export const Tabs = ({ tabs, defaultTab }: TabsProps) => {
  const [active, setActive] = useState(defaultTab || tabs[0]?.key);
  const activeTab = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <div>
      <div className="tabs-bar">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={t.key === active ? "active" : ""}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="tab-panel" key={activeTab?.key}>
        {activeTab?.content}
      </div>
    </div>
  );
};
