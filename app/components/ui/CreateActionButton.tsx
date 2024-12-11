import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { PlusIcon } from "lucide-react";

interface CreateActionButtonProps {
  href: string;
  label: string;
  className?: string;
}

export function CreateActionButton({
  href,
  label,
  className,
}: CreateActionButtonProps) {
  return (
    <Link href={href}>
      <Button size="sm" className="gap-2">
        <PlusIcon className="h-5 w-5" />
        {label && <span className={className}>{label}</span>}
      </Button>
    </Link>
  );
}
