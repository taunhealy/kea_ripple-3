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
    <div className="space-y-6 color">
      <h3 className="font-medium">Search</h3>
      <Input
        type="text"
        placeholder="Search presets..."
        value={searchTerm}
        onChange={(e) => handleSearchChange(e.target.value)}
      />

      <div className="space-y-2">
        <h3 className="font-medium">Price</h3>
        {PRICE_TYPES.map((priceType) => (
          <div key={priceType} className="flex items-center">
            <Checkbox
              id={`price-${priceType}`}
              checked={filters.priceTypes?.includes(priceType)}
              onCheckedChange={(checked) =>
                handleFilterChange("priceTypes", priceType, checked as boolean)
              }
            />
            <Label htmlFor={`price-${priceType}`} className="ml-2">
              {priceType.charAt(0) + priceType.slice(1).toLowerCase()}
            </Label>
          </div>
        ))}
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
        <MultiSelect
          options={
            vsts?.map((vst: any) => ({
              value: vst.id,
              label: vst.name,
            })) || []
          }
          value={filters.vstTypes || []}
          onChange={handleVstsChange}
          placeholder="Search VSTs..."
          className="custom-multiselect"
        />
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
