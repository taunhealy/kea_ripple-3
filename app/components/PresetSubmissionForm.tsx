"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";

interface PresetSubmissionFormData {
  title: string;
  guide?: string;
  soundPreviewUrl?: string;
  presetFileUrl?: string;
  presetType: string;
  vstId?: string;
  price?: number;
  priceType: "FREE" | "PREMIUM";
}

interface PresetSubmissionFormProps {
  requestId: string;
}

export function PresetSubmissionForm({ requestId }: PresetSubmissionFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PresetSubmissionFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);

// Submit preset request form data to the api with the requestId passed
  const onSubmit = async (data: PresetSubmissionFormData) => {
    setIsSubmitting(true);
    // try POST the preset Submission to the database wherein it's connected to a requestId (request)
    try {
      const response = await fetch(`/api/presetRequest/${requestId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit preset");
      }

      toast.success("Preset Submission submitted successfully");
      router.push(`/dashboard/presetRequest/${requestId}`);
    } catch (error) {
      console.error("Error submitting preset:", error);
      toast.error("Failed to submit preset");
    } finally {
      // the useState cycle needs to complete by reverting back to a state of false (not submitting)
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          {...register("title", { required: "Title is required" })}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="guide">Usage Guide</Label>
        <Textarea
          id="guide"
          {...register("guide")}
          placeholder="Explain how to use your preset..."
        />
      </div>

      {/* Add file upload components for soundPreviewUrl and presetFileUrl */}
      {/* Add VST selector */}
      {/* Add price type and amount fields */}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Preset"}
      </Button>
    </form>
  );
}
