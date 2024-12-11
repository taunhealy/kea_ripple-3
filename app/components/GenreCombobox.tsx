"use client";

import { Combobox } from "@/app/components/ui/combobox";
import { useQuery } from "@tanstack/react-query";

interface Genre {
  id: string;
  name: string;
  type: string;
  isSystem: boolean;
}

interface GenreComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

export function GenreCombobox({ value, onChange }: GenreComboboxProps) {
  const { data: genres } = useQuery<Genre[]>({
    queryKey: ["genres"],
    queryFn: async () => {
      const response = await fetch("/api/genres");
      if (!response.ok) throw new Error("Failed to fetch genres");
      return response.json();
    },
  });

  const options =
    genres?.map((genre) => ({
      value: genre.id,
      label: genre.name,
    })) || [];

  const currentOption = options.find((option) => option.value === value);

  return (
    <Combobox
      value={currentOption?.value || ""}
      onSelect={(value) => {
        onChange(value);
      }}
      options={options}
      placeholder="Select genre..."
    />
  );
}
