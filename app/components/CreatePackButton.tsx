import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { PlusIcon } from "lucide-react";

export function CreatePackButton() {
  return (
    <Link href="/dashboard/packs/create">
      <Button>
        <PlusIcon className="h-4 w-4 mr-2" />
        Create Pack
      </Button>
    </Link>
  );
} 