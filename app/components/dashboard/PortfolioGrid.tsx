import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import Link from "next/link";

interface PortfolioImage {
  id: string;
  url: string;
}

interface PortfolioGridProps {
  images: PortfolioImage[];
}

export default function PortfolioGrid({ images }: PortfolioGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((image) => (
        <div key={image.id} className="relative group">
          <Image
            src={image.url}
            alt="Portfolio image"
            width={300}
            height={300}
            className="object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
            <Button asChild size="sm" variant="secondary">
              <Link href={`/dashboard/portfolio/${image.id}/edit`}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button size="sm" variant="destructive">
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
