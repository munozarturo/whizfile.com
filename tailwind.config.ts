import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4539cd",
        secondary: "#ffffff",
      },
      backgroundImage: {
        "tile-1": "url('/tiles/tile_1.png')",
        "tile-2": "url('/tiles/tile_2.png')",
        "tile-3": "url('/tiles/tile_3.png')",
        "tile-4": "url('/tiles/tile_4.png')",
        "tile-5": "url('/tiles/tile_5.png')",
        "tile-6": "url('/tiles/tile_6.png')",
        "tile-7": "url('/tiles/tile_7.png')",
        "tile-8": "url('/tiles/tile_8.png')",
        "tile-9": "url('/tiles/tile_9.png')",
        "tile-10": "url('/tiles/tile_10.png')",
        "tile-11": "url('/tiles/tile_11.png')",
        "tile-12": "url('/tiles/tile_12.png')",
        "tile-13": "url('/tiles/tile_13.png')",
        "tile-14": "url('/tiles/tile_14.png')",
        "tile-15": "url('/tiles/tile_15.png')",
        "tile-16": "url('/tiles/tile_16.png')",
        "tile-17": "url('/tiles/tile_17.png')",
        "tile-18": "url('/tiles/tile_18.png')",
        "tile-19": "url('/tiles/tile_19.png')",
        "tile-20": "url('/tiles/tile_20.png')",
        "tile-21": "url('/tiles/tile_21.png')",
        "tile-22": "url('/tiles/tile_22.png')",
        "tile-23": "url('/tiles/tile_23.png')",
        "tile-24": "url('/tiles/tile_24.png')",
        "tile-25": "url('/tiles/tile_25.png')",
      },
      backgroundSize: {
        "size-tile": "500px 500px",
      },
    },
  },
  plugins: [],
};
export default config;
