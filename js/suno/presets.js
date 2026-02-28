export const SUNO_PRESETS = [
  {
    id: "symphonic-dnb",
    name: "Symphonic DnB",
    genres: ["Symphonic DnB", "Cinematic Bass"],
    bpm: 174,
    instruments: ["strings", "breakbeats", "synth bass", "choir"],
    moodFocus: "비장"
  },
  {
    id: "emotional-glitch-pop",
    name: "Emotional Glitch Pop",
    genres: ["Glitch Pop", "Emotional Electronica"],
    bpm: 146,
    instruments: ["glitch synth", "soft pads", "sub bass", "vocal chops"],
    moodFocus: "감성"
  },
  {
    id: "fantasy-ost",
    name: "Fantasy OST",
    genres: ["Fantasy OST", "Orchestral Pop"],
    bpm: 132,
    instruments: ["harp", "strings", "woodwinds", "taiko"],
    moodFocus: "몽환"
  },
  {
    id: "battle-theme",
    name: "Battle Theme",
    genres: ["Battle Theme", "Hybrid Trailer"],
    bpm: 160,
    instruments: ["brass", "cinematic drums", "low strings", "synth pulses"],
    moodFocus: "전투"
  },
  {
    id: "ending-theme",
    name: "Ending Theme",
    genres: ["Ending Theme", "Ambient Pop"],
    bpm: 118,
    instruments: ["piano", "strings", "soft drums", "ambient textures"],
    moodFocus: "감성"
  },
  {
    id: "dreamwave-anime",
    name: "Dreamwave Anime",
    genres: ["Dreamwave", "Anime Pop"],
    bpm: 128,
    instruments: ["analog synth", "airy guitar", "retro drums", "pads"],
    moodFocus: "몽환"
  },
  {
    id: "idol-rock",
    name: "Idol Rock Anthem",
    genres: ["Anime Rock", "Idol Anthem"],
    bpm: 154,
    instruments: ["electric guitar", "live drums", "bass", "crowd claps"],
    moodFocus: "비장"
  },
  {
    id: "night-drive-city-pop",
    name: "Night Drive City Pop",
    genres: ["City Pop", "Neon Funk"],
    bpm: 122,
    instruments: ["electric piano", "slap bass", "guitar", "drum machine"],
    moodFocus: "감성"
  },
  {
    id: "celestial-ballad",
    name: "Celestial Ballad",
    genres: ["Celestial Ballad", "Cinematic Ambient"],
    bpm: 96,
    instruments: ["piano", "choir", "strings", "soft percussion"],
    moodFocus: "몽환"
  },
  {
    id: "boss-rush",
    name: "Boss Rush",
    genres: ["Boss Battle", "Electro Orchestral"],
    bpm: 178,
    instruments: ["distorted synth", "choir", "percussion", "brass"],
    moodFocus: "전투"
  }
];

export const SUNO_VOCAL_OPTIONS = [
  { value: "female", label: "여성 보컬" },
  { value: "instrumental", label: "무보컬" }
];

export const SUNO_MOOD_OPTIONS = [
  { value: "감성", label: "감성" },
  { value: "비장", label: "비장" },
  { value: "몽환", label: "몽환" },
  { value: "전투", label: "전투" }
];

export const SUNO_LENGTH_OPTIONS = [
  { value: "짧게", label: "짧게" },
  { value: "보통", label: "보통" }
];
