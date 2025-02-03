"use client";
import { useState } from "react";
import { SearchLists } from "./SearchLists";
import { ChatSection } from "./ChatSection";

export function MobileLayout() {
  const [activeTab, setActiveTab] = useState<"Music" | "Chat">("Music");
  return (
    <div className="md:hidden contents">
      <div className="mx-4 flex space-x-2 border-b border-purple-400/20">
        {["Music", "Chat"].map((tab: "Music" | "Chat") => {
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "text-purple-200 border-b-2 border-purple-400"
                  : "text-purple-400 hover:text-purple-200"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>
      <div className={activeTab === "Music" ? "contents h-full" : "hidden"}>
        <SearchLists />
      </div>
      <div className={activeTab === "Chat" ? "contents h-full" : "hidden"}>
        <ChatSection />
      </div>
    </div>
  );
}
