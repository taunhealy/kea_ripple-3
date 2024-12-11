"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePhotographerPortfolio } from "@/app/actions/updatePhotographerPortfolio";
import { Button } from "@/app/components/ui/button";
import { UploadButton } from "@uploadthing/react";
import Image from "next/image";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { useRouter } from "next/navigation";

interface PortfolioFormProps {
  userId: string;
  initialData: {
    id: string;
    portfolioImages: { id: string; url: string }[];
  };
}

export default function PortfolioForm({
  userId,
  initialData,
}: PortfolioFormProps) {
  const [portfolioImages, setPortfolioImages] = useState(
    initialData?.portfolioImages || []
  );
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [projectFilesLink, setProjectFilesLink] = useState<string | null>(null);
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: (formData: FormData) => updatePhotographerPortfolio(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photographerPortfolio"] });
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUpdating(true);
    setErrorMessage(null);
    try {
      const formData = new FormData();
      console.log("Submitting portfolioImages:", portfolioImages);
      formData.append("portfolioImages", JSON.stringify(portfolioImages));
      if (projectFilesLink) {
        formData.append("projectFilesLink", projectFilesLink);
      }
      const result = await mutation.mutateAsync(formData);
      console.log("Mutation result:", result);
      if (result.error) {
        setErrorMessage(result.error);
        setUpdateStatus("error");
      } else {
        setUpdateStatus("success");
        setTimeout(() => router.push("/dashboard/portfolio"), 1000);
      }
    } catch (error) {
      setUpdateStatus("error");
      setErrorMessage("An unexpected error occurred");
      console.error("Error submitting form:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = (id: string) => {
    setPortfolioImages(portfolioImages.filter((img) => img.id !== id));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Portfolio Images
        </label>
        <div className="grid grid-cols-3 gap-4 mt-2">
          {portfolioImages?.map((image) => (
            <div key={image.id} className="relative">
              <Image
                src={image.url}
                alt={`Portfolio image`}
                width={200}
                height={200}
                className="object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => handleDelete(image.id)}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
              >
                X
              </button>
            </div>
          ))}
          {portfolioImages && portfolioImages.length < 9 && (
            // @ts-ignore
            <UploadButton<OurFileRouter>
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                if (res && res[0]) {
                  const newImage = { id: undefined, url: res[0].url };
                  console.log("New image added:", newImage);
                  setPortfolioImages((prev) => {
                    const updatedImages = [...prev, newImage];
                    console.log("Updated portfolioImages:", updatedImages);
                    return updatedImages;
                  });
                }
              }}
              onUploadError={(error: Error) => {
                console.error("Upload error:", error);
                alert(`ERROR! ${error.message}`);
              }}
            />
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Project Files Link
        </label>
        <input
          type="url"
          className="mt-1 block w-full"
          placeholder="Enter project files link"
          onChange={(e) => setProjectFilesLink(e.target.value)}
        />
      </div>

      {errorMessage && <div className="text-red-500">{errorMessage}</div>}

      <Button type="submit" disabled={isUpdating}>
        {isUpdating
          ? "Updating..."
          : updateStatus === "success"
          ? "Success!"
          : updateStatus === "error"
          ? "Failed"
          : "Update Portfolio"}
      </Button>
    </form>
  );
}
