import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { PlusIcon } from "lucide-react";

interface CreateButtonProps {
  href: string;
  label: string;
}

export function CreateButton({ href, label }: CreateButtonProps) {
  return (
    <Link href={href}>
      <Button className="flex items-center gap-2">
        <PlusIcon className="h-4 w-4" />
        {label}
      </Button>
    </Link>
  );
}
