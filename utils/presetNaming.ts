// Create a new file: lib/utils/presetNaming.ts

// Preset type mapping for filename prefixes
const PRESET_TYPE_PREFIXES = {
  PAD: "PD",
  LEAD: "LD",
  PLUCK: "PL",
  BASS: "BS",
  FX: "FX",
  OTHER: "OT",
} as const;

type PresetType = keyof typeof PRESET_TYPE_PREFIXES;

export function formatPresetFileName(
  title: string,
  presetType: PresetType | undefined | null
): string {
  // If no preset type is provided, try to detect it from the title
  const effectivePresetType = presetType ?? detectPresetTypeFromTitle(title) ?? "LEAD";
  
  // Clean and format the title
  let cleanTitle = title
    .replace(/^(PD|LD|PL|BS|FX|OT)\s*[-\s]*/i, "")
    .replace(/^(pad|lead|pluck|bass|fx|other)\s*[-\s]*/i, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-");

  const prefix = PRESET_TYPE_PREFIXES[effectivePresetType];

  // Remove the prefix from the cleanTitle if it already exists
  if (cleanTitle.startsWith(prefix)) {
    cleanTitle = cleanTitle.replace(new RegExp(`^${prefix}_?`, "i"), "");
  }

  return `${prefix}_${cleanTitle}`;
}

function detectPresetTypeFromTitle(title: string): PresetType | null {
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes("pad")) return "PAD";
  if (lowerTitle.includes("lead")) return "LEAD";
  if (lowerTitle.includes("pluck")) return "PLUCK";
  if (lowerTitle.includes("bass")) return "BASS";
  if (lowerTitle.includes("fx")) return "FX";

  return null;
}
