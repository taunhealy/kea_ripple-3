export type PresetPackWithRelations = {
  id: string;
  title: string;
  description: string | undefined;
  price: number;
  presets: {
    preset: {
      id: string;
      title: string;
      price: number;
      soundPreviewUrl: string | undefined;
    };
  }[];
  soundDesigner: {
    username: string;
    profileImage: string | undefined;
  };
};
