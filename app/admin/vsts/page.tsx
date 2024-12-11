"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface VST {
  id: string;
  name: string;
}

export default function VSTManagementPage() {
  const router = useRouter();
  const [vsts, setVsts] = useState<VST[]>([]);
  const [newVstName, setNewVstName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVsts();
  }, []);

  const fetchVsts = async () => {
    try {
      const response = await fetch("/api/admin/vsts");
      if (response.status === 401) {
        toast.error("Unauthorized access");
        router.push("/"); // Redirect to home page
        return;
      }
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
    try {
      const response = await fetch("/api/admin/vsts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newVstName }),
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
      const response = await fetch(`/api/admin/vsts/${id}`, {
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

      <form onSubmit={handleCreate} className="mb-8 flex gap-4">
        <Input
          value={newVstName}
          onChange={(e) => setNewVstName(e.target.value)}
          placeholder="Enter VST name"
          className="max-w-xs"
        />
        <Button type="submit">Add VST</Button>
      </form>

      <div className="space-y-4">
        {vsts.map((vst) => (
          <div
            key={vst.id}
            className="flex items-center justify-between p-4 border rounded"
          >
            <span>{vst.name}</span>
            <Button variant="destructive" onClick={() => handleDelete(vst.id)}>
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
