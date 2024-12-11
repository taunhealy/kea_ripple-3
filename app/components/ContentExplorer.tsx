"use client";

import { PresetGrid } from "@/app/components/shared/PresetGrid";
import { SearchSidebar } from "@/app/components/SearchSidebar";
import { PresetPackGrid } from "@/app/components/shared/PresetPackGrid";
import { PresetRequestGrid } from "@/app/components/shared/PresetRequestGrid";
import { ItemType, RequestStatus } from "@prisma/client";
import { ContentViewMode, RequestViewMode } from "@/types/enums";
import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSearchState } from "@/app/hooks/useSearchState";
import { useContent } from "@/app/hooks/queries/useContent";
import { SearchFilters } from "@/types/SearchTypes";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { CategoryTabs } from "@/app/components/CategoryTabs";
import { CreatePresetButton } from "@/app/components/CreatePresetButton";
import { CreatePackButton } from "@/app/components/CreatePackButton";
import { CreateRequestButton } from "@/app/components/CreateRequestButton";
import { useSession } from "next-auth/react";
import { useSetViewMode } from "@/app/hooks/queries/useViewMode";

interface ContentExplorerProps {
  itemType: ItemType;
  initialFilters: SearchFilters;
  status?: string;
}

export function ContentExplorer({
  itemType,
  initialFilters,
}: ContentExplorerProps) {
  console.log("[DEBUG] ContentExplorer - Initial itemType:", itemType);

  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || getDefaultView(itemType);
  const contentViewMode = view as ContentViewMode | RequestViewMode;

  const { data, isLoading } = useContent({
    itemType,
    filters: {
      ...initialFilters,
      view: view as ContentViewMode | RequestViewMode,
    },
  });

  console.log("[DEBUG] ContentExplorer - useContent result:", {
    data,
    isLoading,
    filters: {
      ...initialFilters,
      view,
    },
  });

  const items = data || [];

  const { filters, updateFilters } = useSearchState();

  const [state, setState] = useState<{
    activeTab: ContentViewMode | RequestViewMode;
    status: string;
  }>(() => ({
    activeTab: contentViewMode,
    status: RequestStatus.OPEN,
  }));

  const setViewMode = useSetViewMode();

  useEffect(() => {
    setViewMode(view as ContentViewMode | RequestViewMode);
  }, [view]);

  const renderRequestTabs = () => {
    const { status } = useSession();
    const isAuthenticated = status === "authenticated";

    const handleTabChange = (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("view", value);
      router.push(`/requests?${params.toString()}`);
      setState((prev) => ({
        ...prev,
        activeTab: value as ContentViewMode | RequestViewMode,
      }));
    };
    

    return (
      <div className="space-y-4">
       <div>

        
  <button
    onClick={() => handleTabChange(RequestViewMode.PUBLIC)}
    style={{
      all: "unset",
      cursor: "pointer",
      fontWeight: state.activeTab === RequestViewMode.PUBLIC ? "bold" : "normal",
    }}
  >
    All
  </button>
  {isAuthenticated && (
    <>
      {" | "}
      <button
        onClick={() => handleTabChange(RequestViewMode.REQUESTED)}
        style={{
          all: "unset",
          cursor: "pointer",
          fontWeight:
            state.activeTab === RequestViewMode.REQUESTED ? "bold" : "normal",
        }}
      >
        My Requests
      </button>
    </>
  )}
</div>


      <div className="flex space-x-4 mb-4">
  {[
    { label: "Open", value: RequestStatus.OPEN },
    { label: "Satisfied", value: RequestStatus.SATISFIED },
  ].map((tab) => (
    <button
      key={tab.value}
      className={`text-sm ${
        state.status === tab.value
          ? "font-bold text-black"
          : "text-gray-600 hover:text-black"
      }`}
      onClick={() => {
        const params = new URLSearchParams(searchParams.toString());
        const currentView = params.get("view") || state.activeTab;
        params.set("view", currentView);
        params.set("status", tab.value);
        router.push(`/requests?${params.toString()}`);
        setState((prev) => ({
          ...prev,
          status: tab.value,
        }));
      }}
    >
      {tab.label}
    </button>
  ))}
</div>


        <PresetRequestGrid
          requests={items}
          requestViewMode={state.activeTab as RequestViewMode}
          isLoading={isLoading}
        />
      </div>
    );
  };

  const renderContentTabs = () => {
    const { status } = useSession();
    const isAuthenticated = status === "authenticated";
    return (
      <div className="space-y-4">
        {isAuthenticated && (
          <div className="flex space-x-6 mb-4">
            {[
              { label: "Explore", value: ContentViewMode.EXPLORE },
              { label: "My Uploads", value: ContentViewMode.UPLOADED },
              { label: "My Downloads", value: ContentViewMode.DOWNLOADED },
            ].map((tab) => (
              <button
                key={tab.value}
                className={`text-base font-medium ${
                  state.activeTab === tab.value
                    ? "text-black"
                    : "text-gray-500 hover:text-black"
                }`}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("view", tab.value);
                  router.push(`/${itemType.toLowerCase()}s?${params.toString()}`);
                  setState((prev) => ({
                    ...prev,
                    activeTab: tab.value as ContentViewMode | RequestViewMode,
                  }));
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
        {renderContentGrid()}
      </div>
    );
    
  };

  const renderContentGrid = () => {
    if (itemType === ItemType.PRESET) {
      return (
        <PresetGrid
          presets={items}
          contentViewMode={contentViewMode as ContentViewMode}
          isLoading={isLoading}
        />
      );
    }
    return (
      <PresetPackGrid
        packs={items}
        contentViewMode={contentViewMode as ContentViewMode}
        isLoading={isLoading}
      />
    );
  };

  const renderContent = () => {
    if (itemType === ItemType.REQUEST) {
      return renderRequestTabs();
    }
    return renderContentTabs();
  };

  const renderCreateButton = () => {
    switch (itemType) {
      case ItemType.PRESET:
        return <CreatePresetButton />;
      case ItemType.PACK:
        return <CreatePackButton />;
      case ItemType.REQUEST:
        return <CreateRequestButton />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-w-[1024px]">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 min-w-[256px] space-y-6">
          <SearchSidebar className="bg-black"
            filters={filters}
            updateFilters={updateFilters}
            itemType={itemType}
          />
        </aside>
        <main className="flex-1 min-w-[640px]">
          <CategoryTabs
            selectedItemType={itemType}
            onSelect={(type) => {
              // Let CategoryTabs handle the routing
              // Remove any duplicate routing logic here
            }}
          />
          <div className="flex justify-between items-center mb-6">
            <div className="flex justify-between items-center w-full">
              <div />
              {renderCreateButton()}
            </div>
          </div>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

const getDefaultView = (
  itemType: ItemType
): ContentViewMode | RequestViewMode => {
  if (itemType === ItemType.REQUEST) {
    return RequestViewMode.PUBLIC;
  }
  return ContentViewMode.EXPLORE;
};
