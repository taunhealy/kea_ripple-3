import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { PlusIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export function CreatePresetButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Navigate to create preset page
      await router.push("/dashboard/presets/create");
    } catch (error) {
      toast.error("Failed to navigate to create preset page");
      console.error("Navigation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Link href="/dashboard/presets/create" onClick={handleClick}>
      <Button disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <PlusIcon className="h-4 w-4 mr-2" />
        )}
        {isLoading ? "Loading..." : "Create Preset"}
      </Button>
    </Link>
  );
}
