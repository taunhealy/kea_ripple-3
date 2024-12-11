import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import {
  changePortfolioImage,
  deletePortfolioImage,
} from "@/app/actions/portfolioActions";

interface PortfolioImage {
  id: string;
  url: string;
}

interface PortfolioEditGridProps {
  images: PortfolioImage[];
}

export default function PortfolioEditGrid({ images }: PortfolioEditGridProps) {
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
            <Button
              // @ts-ignore
              onClick={(e) => changePortfolioImage(image.id, e)}
              size="sm"
              variant="secondary"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Change
            </Button>
            <Button
              onClick={() => deletePortfolioImage(image.id)}
              size="sm"
              variant="destructive"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
