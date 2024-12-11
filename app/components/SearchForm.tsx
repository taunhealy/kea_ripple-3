"use client";

import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { SearchFilters } from "@/types/SearchTypes";
import { PresetType } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface SearchFormProps {
  filters: SearchFilters;
  onSubmit: (data: SearchFilters) => void;
}

const searchSchema = z.object({
  searchTerm: z.string().default(""),
  presetTypes: z.array(z.enum(["preset", "sample"])).default([]),
  genres: z.array(z.string()).default([]),
  vstTypes: z.array(z.string()).default([]),
});

export function SearchForm({ filters, onSubmit }: SearchFormProps) {
  const { register, handleSubmit } = useForm<SearchFilters>({
    defaultValues: filters,
    resolver: zodResolver(searchSchema),
  });

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Search Presets and Samples</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="searchTerm">Search</Label>
            <Input
              id="searchTerm"
              type="text"
              placeholder="Search for presets and samples..."
              {...register("searchTerm")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="type-preset"
                  {...register("presetTypes")}
                  value="preset"
                />
                <Label htmlFor="type-preset">Preset</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="type-sample"
                  {...register("presetTypes")}
                  value="sample"
                />
                <Label htmlFor="type-sample">Sample</Label>
              </div>
            </div>
          </div>

          <Button type="submit">Search</Button>
        </form>
      </CardContent>
    </Card>
  );
}
