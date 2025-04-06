interface TabNavigationProps {
  activeTab: "bio" | "converter";
  setActiveTab: (tab: "bio" | "converter") => void;
}

export default function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  return (
    <div className="flex border-b border-neutral-200 mb-8">
      <button 
        className={`px-4 py-3 font-medium text-center ${activeTab === "bio" ? "tab-active" : ""}`}
        onClick={() => setActiveTab("bio")}
      >
        <i className="ri-links-line mr-2"></i>Bio Links
      </button>
      <button 
        className={`px-4 py-3 font-medium text-center ${activeTab === "converter" ? "tab-active" : ""}`}
        onClick={() => setActiveTab("converter")}
      >
        <i className="ri-scales-3-line mr-2"></i>Recipe Converter
      </button>
    </div>
  );
}
