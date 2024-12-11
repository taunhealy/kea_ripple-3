import { CartType } from "@prisma/client";

// Helper functions for type checking
export function isValidCartType(type: string): type is CartType {
  return ["CART", "WISHLIST"].includes(type.toUpperCase() as CartType);
}

export function assertCartType(type: string): CartType {
  const upperType = type.toUpperCase() as CartType;
  if (!isValidCartType(upperType)) {
    throw new Error(`Invalid cart type: ${type}`);
  }
  return upperType;
}
