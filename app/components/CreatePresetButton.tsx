import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { PlusIcon } from "lucide-react";

export function CreatePresetButton() {
  return (
    <Link href="/dashboard/presets/create">
      <Button>
        <PlusIcon className="h-4 w-4 mr-2" />
        Create Preset
      </Button>
    </Link>
  );
}
