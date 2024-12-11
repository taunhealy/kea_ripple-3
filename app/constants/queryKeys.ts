export const queryKeys = {
  presets: {
    all: ["presets"] as const,
    detail: (id: string) => ["preset", id] as const,
  },
};
