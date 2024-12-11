"use client";

import { useQuery } from "@tanstack/react-query";
import { PresetPackCard } from "@/app/components/PresetPackCard";
import { Button } from "@/app/components/ui/button";
import { ShoppingCartIcon, HeartIcon } from "lucide-react";
import { useCart } from "@/app/hooks/useCart";
import { useWishlist } from "@/app/hooks/useWishlist";
import { toast } from "react-hot-toast";
import { ContentViewMode } from "@/types/enums";

export default function PackPage({ params }: { params: { id: string } }) {
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  const { data: pack, isLoading } = useQuery({
    queryKey: ["presetPack", params.id],
    queryFn: async () => {
      const response = await fetch(`/api/presetPacks/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch pack");
      return response.json();
    },
  });

  const handleAddToCart = async () => {
    try {
      await addToCart(pack.id, "PACK");
      toast.success("Pack added to cart");
    } catch (error) {
      toast.error("Failed to add pack to cart");
    }
  };

  const handleAddToWishlist = async () => {
    try {
      await addToWishlist(pack.id, "PACK");
      toast.success("Pack added to wishlist");
    } catch (error) {
      toast.error("Failed to add pack to wishlist");
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!pack) return <div>Pack not found</div>;
  if (!pack.presets) return <div>Invalid pack data</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <PresetPackCard pack={pack} contentViewMode={ContentViewMode.EXPLORE} />
        <div className="flex gap-2 mt-4">
          <Button
            onClick={handleAddToCart}
            variant="default"
            className="flex-1"
          >
            <ShoppingCartIcon className="mr-2 h-4 w-4" />
            Add to Cart ${pack.price}
          </Button>
          <Button
            onClick={handleAddToWishlist}
            variant="secondary"
            className="flex-1"
          >
            <HeartIcon className="mr-2 h-4 w-4" />
            Add to Wishlist
          </Button>
        </div>
      </div>
    </div>
  );
}
