// app/components/ui/PriceChangeDisplay.tsx
interface PriceChangeProps {
  currentPrice: number;
  previousPrice?: number;
  size?: string;
  className?: string;
  itemType?: string;
}

export function PriceChangeDisplay({
  currentPrice,
  previousPrice,
}: PriceChangeProps) {
  if (!currentPrice || !previousPrice) {
    return null;
  }

  const percentageChange =
    ((currentPrice - previousPrice) / previousPrice) * 100;
  const isPriceIncrease = currentPrice > previousPrice;

  return (
    <div className="flex flex-col text-md">
      <span className="line-through text-gray-500">
        ${previousPrice.toFixed(2)}
      </span>
      <span
        className={`${isPriceIncrease ? "text-red-500" : "text-green-500"}`}
      >
        {isPriceIncrease ? "↑" : "↓"} {Math.abs(percentageChange).toFixed(1)}%
      </span>
    </div>
  );
}
