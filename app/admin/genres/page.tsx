"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Genre {
  id: string;
  name: string;
  type: string;
  isSystem: boolean;
}

export default function AdminGenresPage() {
  const [newGenreName, setNewGenreName] = useState("");
  const queryClient = useQueryClient();

  // Move mutations before any conditional returns
  const addGenreMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch("/api/genres/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error("Failed to add genre");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["genres"] });
      setNewGenreName("");
    },
  });

  const deleteGenreMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/genres/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete genre");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["genres"] });
    },
  });

  // Fetch genres query
  const {
    data: genres,
    isLoading,
    error,
  } = useQuery<Genre[]>({
    queryKey: ["genres"],
    queryFn: async () => {
      const response = await fetch("/api/genres");
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Genre fetch error:", errorData);
        throw new Error(errorData.error || "Failed to fetch genres");
      }
      return response.json();
    },
  });

  // Show error state
  if (error) {
    return (
      <div className="p-4">
        <div className="bg-destructive/15 text-destructive p-4 rounded-lg">
          <h2 className="font-semibold">Error loading genres</h2>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-secondary rounded w-1/4"></div>
          <div className="h-10 bg-secondary rounded"></div>
          <div className="h-10 bg-secondary rounded"></div>
        </div>
      </div>
    );
  }

  const handleAddGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGenreName.trim()) return;
    addGenreMutation.mutate(newGenreName);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Genre Management</h1>

      {/* Add new genre form */}
      <form onSubmit={handleAddGenre} className="mb-8">
        <div className="flex gap-4">
          <Input
            type="text"
            value={newGenreName}
            onChange={(e) => setNewGenreName(e.target.value)}
            placeholder="Enter new genre name"
            className="max-w-xs"
          />
          <Button type="submit" disabled={addGenreMutation.isPending}>
            Add Genre
          </Button>
        </div>
      </form>

      {/* System genres section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">System Genres</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {genres
            ?.filter((genre) => genre.isSystem)
            .map((genre) => (
              <div
                key={genre.id}
                className="flex items-center justify-between p-3 bg-secondary rounded-lg"
              >
                <span>{genre.name}</span>
                <span className="text-sm text-muted-foreground">System</span>
              </div>
            ))}
        </div>
      </div>

      {/* Custom genres section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Custom Genres</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {genres
            ?.filter((genre) => !genre.isSystem)
            .map((genre) => (
              <div
                key={genre.id}
                className="flex items-center justify-between p-3 bg-secondary rounded-lg"
              >
                <span>{genre.name}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteGenreMutation.mutate(genre.id)}
                  disabled={deleteGenreMutation.isPending}
                >
                  Delete
                </Button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
