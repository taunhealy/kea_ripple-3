"use client";

import { PresetGrid } from "@/app/components/shared/PresetGrid";
import { SearchSidebar } from "@/app/components/SearchSidebar";
import { PresetPackGrid } from "@/app/components/shared/PresetPackGrid";
import { PresetRequestGrid } from "@/app/components/shared/PresetRequestGrid";
import { ItemType, RequestStatus } from "@prisma/client";
import { ContentViewMode, RequestViewMode } from "@/types/enums";
import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSearchState } from "@/app/hooks/useSearchState";
import { useContent } from "@/app/hooks/queries/useContent";
import { SearchFilters } from "@/types/SearchTypes";
import { CreatePresetButton } from "@/app/components/CreatePresetButton";
import { CreatePackButton } from "@/app/components/CreatePackButton";
import { CreateRequestButton } from "@/app/components/CreateRequestButton";
import { useSession } from "next-auth/react";
import { useSetViewMode } from "@/app/hooks/queries/useViewMode";
import { Compass, Upload, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";

interface ContentExplorerProps {
  itemType: ItemType;
  initialFilters: SearchFilters;
  status?: string;
}

export function ContentExplorer({
  itemType,
  initialFilters,
}: ContentExplorerProps) {
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
              { 
                label: "Explore", 
                value: ContentViewMode.EXPLORE,
                icon: Compass 
              },
              { 
                label: "My Uploads", 
                value: ContentViewMode.UPLOADED,
                icon: Upload 
              },
              { 
                label: "My Downloads", 
                value: ContentViewMode.DOWNLOADED,
                icon: Download 
              },
            ].map((tab) => (
              <button
                key={tab.value}
                className={cn(
                  "text-base font-medium flex items-center gap-2 transition-colors duration-200",
                  state.activeTab === tab.value
                    ? "text-[hsl(var(--brand-text-active))]"
                    : "text-[hsl(var(--brand-text-inactive))] hover:text-[hsl(var(--brand-text-hover))]"
                )}
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
                <tab.icon className="h-4 w-4" />
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
          buttonVariants={{
            edit: "bg-[hsl(var(--background))] text-white hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] border border-[hsl(var(--accent))]",
            delete: "bg-[hsl(var(--background))] text-white hover:bg-destructive hover:text-destructive-foreground border border-destructive",
            download: "bg-[hsl(var(--background))] text-white hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] border border-[hsl(var(--accent))]"
          }}
        />
      );
    }
    return (
      <PresetPackGrid
        packs={items}
        contentViewMode={contentViewMode as ContentViewMode}
        isLoading={isLoading}
        buttonVariants={{
          edit: "bg-[hsl(var(--background))] text-white hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] border border-[hsl(var(--accent))]",
          delete: "bg-[hsl(var(--background))] text-white hover:bg-destructive hover:text-destructive-foreground border border-destructive",
          download: "bg-[hsl(var(--background))] text-white hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] border border-[hsl(var(--accent))]"
        }}
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

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const isCreatorTheme = state.activeTab === ContentViewMode.UPLOADED || 
                          state.activeTab === ContentViewMode.DOWNLOADED;

    const tl = gsap.timeline();

    // Animate all theme elements
    tl.to('.theme-transition', {
      duration: 0.5,
      backgroundColor: isCreatorTheme ? '#1a1a1a' : '#001B3A',
      borderColor: isCreatorTheme ? '#333' : '#1e3a5f',
      color: isCreatorTheme ? '#ffffff' : '#ffffff',
      ease: "power2.inOut",
    });

  }, [state.activeTab]);

  return (
    <div 
      className="min-h-screen w-full theme-transition"
      data-theme={
        state.activeTab === ContentViewMode.UPLOADED || 
        state.activeTab === ContentViewMode.DOWNLOADED 
          ? "creator" 
          : "default"
      }
    >
      <div 
        ref={containerRef}
        className="container mx-auto px-4 py-8 theme-transition"
      >
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 min-w-[256px] theme-transition">
            <SearchSidebar
              className="theme-transition"
              filters={filters}
              updateFilters={updateFilters}
              itemType={itemType}
            />
          </aside>
          <main className="flex-1 theme-transition">
            <div className="flex justify-end mb-4">
              {renderCreateButton()}
            </div>
            {renderContent()}
          </main>
        </div>
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
