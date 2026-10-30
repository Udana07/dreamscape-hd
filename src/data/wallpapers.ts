export type DeviceType = "mobile" | "desktop";

export type Wallpaper = {
  id: string;
  title: string;
  slug: string;
  category: string;
  device: DeviceType;
  thumbnail: string;
  image: string;
  width: number;
  height: number;
  resolution: string;
  format: string;
  description: string;
  tags: string[];
  downloadUrl: string | null;
  uploadedAt: string;
  trending?: boolean;
};

export const wallpapers: Wallpaper[] = [
  {
    id: "ds-001",
    title: "Alpine Stillness",
    slug: "alpine-stillness",
    category: "Nature",
    device: "desktop",
    thumbnail: "/wallpapers/alpine-stillness-thumb.webp",
    image: "/wallpapers/alpine-stillness.webp",
    width: 1672,
    height: 941,
    resolution: "1672 x 941",
    format: "WebP",
    description: "Morning light rests on an alpine lake and its quiet reflection.",
    tags: ["mountains", "lake", "sunrise", "nature"],
    downloadUrl: null,
    uploadedAt: "2026-10-28",
    trending: true,
  },
  {
    id: "ds-002",
    title: "Coastal Light",
    slug: "coastal-light",
    category: "Ocean",
    device: "desktop",
    thumbnail: "/wallpapers/coastal-light-thumb.webp",
    image: "/wallpapers/coastal-light.webp",
    width: 1672,
    height: 941,
    resolution: "1672 x 941",
    format: "WebP",
    description: "Sunlit cliffs meet clear blue water along a sculptural coastline.",
    tags: ["coast", "ocean", "cliffs", "travel"],
    downloadUrl: null,
    uploadedAt: "2026-10-27",
    trending: true,
  },
  {
    id: "ds-003",
    title: "Desert Afterglow",
    slug: "desert-afterglow",
    category: "Nature",
    device: "desktop",
    thumbnail: "/wallpapers/desert-afterglow-thumb.webp",
    image: "/wallpapers/desert-afterglow.webp",
    width: 1672,
    height: 941,
    resolution: "1672 x 941",
    format: "WebP",
    description: "Soft evening shadows trace the curves of a desert dune.",
    tags: ["desert", "dunes", "sunset", "minimal"],
    downloadUrl: null,
    uploadedAt: "2026-10-26",
    trending: true,
  },
  {
    id: "ds-004",
    title: "Forest Passage",
    slug: "forest-passage",
    category: "Nature",
    device: "mobile",
    thumbnail: "/wallpapers/forest-passage-thumb.webp",
    image: "/wallpapers/forest-passage.webp",
    width: 941,
    height: 1672,
    resolution: "941 x 1672",
    format: "WebP",
    description: "A winding road leads through mist and deep green mountain forest.",
    tags: ["forest", "road", "mountains", "green"],
    downloadUrl: null,
    uploadedAt: "2026-10-29",
    trending: true,
  },
  {
    id: "ds-005",
    title: "Blush Anthurium",
    slug: "blush-anthurium",
    category: "Botanical",
    device: "mobile",
    thumbnail: "/wallpapers/blush-anthurium-thumb.webp",
    image: "/wallpapers/blush-anthurium.webp",
    width: 941,
    height: 1672,
    resolution: "941 x 1672",
    format: "WebP",
    description: "A delicate pink bloom catches the soft afternoon light.",
    tags: ["flower", "pink", "botanical", "minimal"],
    downloadUrl: null,
    uploadedAt: "2026-10-28",
    trending: true,
  },
  {
    id: "ds-006",
    title: "Fluid Forms",
    slug: "fluid-forms",
    category: "Abstract",
    device: "mobile",
    thumbnail: "/wallpapers/fluid-forms-thumb.webp",
    image: "/wallpapers/fluid-forms.webp",
    width: 941,
    height: 1672,
    resolution: "941 x 1672",
    format: "WebP",
    description: "Luminous blue and coral forms fold into a vivid abstract study.",
    tags: ["abstract", "blue", "coral", "3d"],
    downloadUrl: null,
    uploadedAt: "2026-10-27",
    trending: true,
  },
  {
    id: "ds-007",
    title: "Tidal Calm",
    slug: "tidal-calm",
    category: "Ocean",
    device: "mobile",
    thumbnail: "/wallpapers/tidal-calm-thumb.webp",
    image: "/wallpapers/tidal-calm.webp",
    width: 941,
    height: 1672,
    resolution: "941 x 1672",
    format: "WebP",
    description: "Turquoise water rolls onto a quiet shore in gentle layers.",
    tags: ["ocean", "waves", "beach", "blue"],
    downloadUrl: null,
    uploadedAt: "2026-10-30",
  },
  {
    id: "ds-008",
    title: "Sunlit Arches",
    slug: "sunlit-arches",
    category: "Abstract",
    device: "mobile",
    thumbnail: "/wallpapers/sunlit-arches-thumb.webp",
    image: "/wallpapers/sunlit-arches.webp",
    width: 940,
    height: 1672,
    resolution: "940 x 1672",
    format: "WebP",
    description: "Curved architectural forms frame a slice of clear sky.",
    tags: ["architecture", "abstract", "terracotta", "minimal"],
    downloadUrl: null,
    uploadedAt: "2026-10-29",
  },
  {
    id: "ds-009",
    title: "Cedar Morning",
    slug: "cedar-morning",
    category: "Nature",
    device: "desktop",
    thumbnail: "/wallpapers/cedar-morning-thumb.webp",
    image: "/wallpapers/cedar-morning.webp",
    width: 1672,
    height: 941,
    resolution: "1672 x 941",
    format: "WebP",
    description: "A ribbon of warm light falls across a tranquil woodland path.",
    tags: ["forest", "trees", "green", "morning"],
    downloadUrl: null,
    uploadedAt: "2026-10-30",
  },
  {
    id: "ds-010",
    title: "River Bend",
    slug: "river-bend",
    category: "Nature",
    device: "desktop",
    thumbnail: "/wallpapers/river-bend-thumb.webp",
    image: "/wallpapers/river-bend.webp",
    width: 1672,
    height: 941,
    resolution: "1672 x 941",
    format: "WebP",
    description: "A teal river winds between lush green ridgelines.",
    tags: ["river", "mountains", "aerial", "nature"],
    downloadUrl: null,
    uploadedAt: "2026-10-29",
  },
  {
    id: "ds-011",
    title: "Soft Geometry",
    slug: "soft-geometry",
    category: "Abstract",
    device: "desktop",
    thumbnail: "/wallpapers/soft-geometry-thumb.webp",
    image: "/wallpapers/soft-geometry.webp",
    width: 1672,
    height: 941,
    resolution: "1672 x 941",
    format: "WebP",
    description: "Sculptural curves and soft color create a restful composition.",
    tags: ["abstract", "minimal", "shapes", "pastel"],
    downloadUrl: null,
    uploadedAt: "2026-10-28",
  },
];

export function getDownloadUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    const driveHost = url.hostname === "drive.google.com" || url.hostname === "drive.usercontent.google.com";
    return url.protocol === "https:" && driveHost && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

export function getImageUrl(value: string | null): string | null {
  if (!value || value.length > 2048) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}
