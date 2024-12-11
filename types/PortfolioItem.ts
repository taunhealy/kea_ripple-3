export interface PortfolioItem {
  id: number;
  title: string;
  category: string;
  country: string;
  focalLength: string;
  camera: string;
  lens: string;
  imageUrl: string; // Add this line
  photographer: {
    name: string;
    websiteUrl: string | null; // Allow websiteUrl to be null
    images: {
      id: string;
      url: string;
    }[];
  };
  driver: {
    id: string;
    name: string;
  };
}
