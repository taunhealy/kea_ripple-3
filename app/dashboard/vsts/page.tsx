"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { toast } from "react-hot-toast";

interface VST {
  id: string;
  name: string;
}

export default function VSTManagementPage() {
  const [vsts, setVsts] = useState<VST[]>([]);
  const [newVstName, setNewVstName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVsts();
  }, []);

  const fetchVsts = async () => {
    try {
      const response = await fetch("/api/vsts");
      if (!response.ok) throw new Error("Failed to fetch VSTs");
      const data = await response.json();
      setVsts(data);
    } catch (error) {
      toast.error("Failed to load VSTs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVstName.trim()) return;

    try {
      const response = await fetch("/api/vsts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newVstName.trim() }),
      });

      if (!response.ok) throw new Error("Failed to create VST");

      await fetchVsts();
      setNewVstName("");
      toast.success("VST created successfully");
    } catch (error) {
      toast.error("Failed to create VST");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this VST?")) return;

    try {
      const response = await fetch(`/api/vsts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete VST");

      await fetchVsts();
      toast.success("VST deleted successfully");
    } catch (error) {
      toast.error("Failed to delete VST");
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">VST Management</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <form onSubmit={handleCreate} className="flex gap-4">
          <Input
            type="text"
            value={newVstName}
            onChange={(e) => setNewVstName(e.target.value)}
            placeholder="Enter VST name"
            className="flex-1"
          />
          <Button type="submit">Add VST</Button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow">
        {vsts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No VSTs found. Add one above.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {vsts.map((vst) => (
              <li
                key={vst.id}
                className="p-4 flex items-center justify-between"
              >
                <span className="text-lg">{vst.name}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(vst.id)}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
