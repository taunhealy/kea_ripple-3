import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { PlusIcon } from "lucide-react";

export function CreateRequestButton() {
  return (
    <Link href="/dashboard/requests/create">
      <Button>
        <PlusIcon className="h-4 w-4 mr-2" />
        Create Request
      </Button>
    </Link>
  );
}
