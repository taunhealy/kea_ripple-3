import { Button } from "@/app/components/ui/button";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";

interface SubmitPresetButtonProps {
  requestId: string;
}

export function SubmitPresetButton({ requestId }: SubmitPresetButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/dashboard/presetRequest/${requestId}/submit`);
  };

  return (
    <Button onClick={handleClick} className="w-full">
      <PlusIcon className="h-4 w-4 mr-2" />
      Submit Preset
    </Button>
  );
}
