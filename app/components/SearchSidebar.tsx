"use client";

import { useGenres } from "@/app/hooks/useGenres";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { PresetType, PriceType } from "@prisma/client";
import { SearchFilters } from "@/types/SearchTypes";
import { useDebounce } from "@/app/hooks/useDebounce";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ItemType } from "@prisma/client";
import { MultiSelect } from "@/app/components/ui/MultiSelect";
import { Switch } from "@/app/components/ui/switch";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

const PRESET_TYPES = Object.values(PresetType);
const PRICE_TYPES = Object.values(PriceType);

interface SearchSidebarProps {
  filters: SearchFilters;
  updateFilters: (filters: SearchFilters) => void;
  itemType: ItemType;
  className: String;
}

export const SearchSidebar: React.FC<SearchSidebarProps> = ({
  filters,
  updateFilters,
  itemType,
}) => {
  const { data: genres } = useGenres();
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || "");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const queryClient = useQueryClient();

  // Fetch VSTs
  const { data: vsts } = useQuery({
    queryKey: ["vsts"],
    queryFn: async () => {
      const response = await fetch("/api/vsts");
      if (!response.ok) throw new Error("Failed to fetch VSTs");
      return response.json();
    },
  });

  const filterMutation = useMutation({
    mutationFn: (newFilters: Partial<SearchFilters>) => {
      updateFilters(newFilters);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presets"] });
    },
  });

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    filterMutation.mutate({
      ...filters,
      searchTerm: value,
    });
  };

  const handleGenresChange = (selectedGenres: string[]) => {
    filterMutation.mutate({
      ...filters,
      genres: selectedGenres,
    });
  };

  const handleVstsChange = (selectedVsts: string[]) => {
    filterMutation.mutate({
      ...filters,
      vstTypes: selectedVsts,
    });
  };

  const handleFilterChange = (
    key: keyof SearchFilters,
    value: any,
    checked: boolean
  ) => {
    const newFilters = {
      ...filters,
      [key]: checked
        ? Array.isArray(filters[key])
          ? [...filters[key], value]
          : [value]
        : Array.isArray(filters[key])
        ? filters[key].filter((item: any) => item !== value)
        : [],
    };
    filterMutation.mutate(newFilters);
  };

  return (
    <div className="theme-transition bg-card border rounded-lg p-4">
      <h3 className="font-medium">Search</h3>
      <Input
        type="text"
        placeholder="Search presets..."
        value={searchTerm}
        onChange={(e) => handleSearchChange(e.target.value)}
      />

      <div className="space-y-2">
        
        <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1">
          <button
            onClick={() => {
              filterMutation.mutate({
                ...filters,
                priceTypes: ["FREE"]
              });
            }}
            className={cn(
              "rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
              filters.priceTypes?.includes("FREE") 
                ? "bg-background shadow" 
                : "text-muted-foreground hover:bg-background/50"
            )}
          >
            Free
          </button>
          <button
            onClick={() => {
              filterMutation.mutate({
                ...filters,
                priceTypes: ["PREMIUM"]
              });
            }}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
              filters.priceTypes?.includes("PREMIUM") 
                ? "bg-background shadow" 
                : "text-muted-foreground hover:bg-background/50"
            )}
          >
            Premium
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Preset Type</h3>
        {PRESET_TYPES.map((presetType) => (
          <div key={presetType} className="flex items-center">
            <Checkbox
              id={`preset-${presetType}`}
              checked={filters.presetTypes?.includes(presetType)}
              onCheckedChange={(checked) =>
                handleFilterChange("presetTypes", presetType, checked as boolean)
              }
            />
            <Label htmlFor={`preset-${presetType}`} className="ml-2">
              {presetType.charAt(0) + presetType.slice(1).toLowerCase()}
            </Label>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">VST</h3>
        <div className="flex flex-col gap-1 rounded-md bg-muted p-1">
          {console.log("Current vstTypes:", filters.vstTypes)}
          <button
            onClick={() => {
              filterMutation.mutate({
                ...filters,
                vstTypes: []  // Empty array means "All"
              });
            }}
            className={cn(
              "rounded-sm px-3 py-1.5 text-sm font-medium transition-all flex items-center justify-between",
              (!filters.vstTypes?.length || filters.vstTypes === undefined)
                ? "bg-background shadow"
                : "text-muted-foreground hover:bg-background/50"
            )}
          >
            <span>All</span>
            {(!filters.vstTypes?.length || filters.vstTypes === undefined) ? (
              <Minus className="h-4 w-4 ml-2" />
            ) : (
              <Plus className="h-4 w-4 ml-2" />
            )}
          </button>
          {vsts?.filter((vst: any) => 
            ['Serum', 'Vital', 'Phase Plant'].includes(vst.name)
          ).map((vst: any) => (
            <button
              key={vst.id}
              onClick={() => {
                filterMutation.mutate({
                  ...filters,
                  vstTypes: filters.vstTypes?.includes(vst.id)
                    ? filters.vstTypes.filter(v => v !== vst.id)
                    : [...(filters.vstTypes || []), vst.id]
                });
              }}
              className={cn(
                "rounded-sm px-3 py-1.5 text-sm font-medium transition-all flex items-center justify-between",
                filters.vstTypes?.includes(vst.id)
                  ? "bg-background shadow"
                  : "text-muted-foreground hover:bg-background/50"
              )}
            >
              <span>{vst.name}</span>
              {filters.vstTypes?.includes(vst.id) ? (
                <Minus className="h-4 w-4 ml-2" />
              ) : (
                <Plus className="h-4 w-4 ml-2" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Genres</h3>
        <MultiSelect
          options={
            genres?.map((genre: any) => ({
              value: genre.id,
              label: genre.name,
            })) || []
          }
          value={filters.genres || []}
          onChange={handleGenresChange}
          placeholder="Search genres..."
          className="custom-multiselect"
        />
      </div>
    </div>
  );
};
