export type Choice = {
    id: string;
    label: string;
    shortLabel?: string;
    emoji?: string;
    accent: string;
  };
  
  export type Question = {
    id: string;
    eyebrow: string;
    prompt: string;
    choices: Choice[];
  };
  
  export const questions: Question[] = [
    {
      id: "france-spain-winner",
      eyebrow: "Semi-final 1",
      prompt: "Who reaches the final?",
      choices: [
        {
          id: "france",
          label: "France",
          emoji: "🇫🇷",
          accent: "#2563eb",
        },
        {
          id: "spain",
          label: "Spain",
          emoji: "🇪🇸",
          accent: "#ef4444",
        },
      ],
    },
    {
      id: "england-argentina-winner",
      eyebrow: "Semi-final 2",
      prompt: "Who reaches the final?",
      choices: [
        {
          id: "england",
          label: "England",
          emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
          accent: "#f8fafc",
        },
        {
          id: "argentina",
          label: "Argentina",
          emoji: "🇦🇷",
          accent: "#60a5fa",
        },
      ],
    },
    {
      id: "world-cup-winner",
      eyebrow: "The ultimate question",
      prompt: "Who lifts the trophy?",
      choices: [
        {
          id: "france",
          label: "France",
          emoji: "🇫🇷",
          accent: "#2563eb",
        },
        {
          id: "spain",
          label: "Spain",
          emoji: "🇪🇸",
          accent: "#ef4444",
        },
        {
          id: "england",
          label: "England",
          emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
          accent: "#f8fafc",
        },
        {
          id: "argentina",
          label: "Argentina",
          emoji: "🇦🇷",
          accent: "#60a5fa",
        },
      ],
    },
    {
      id: "penalty-shootout",
      eyebrow: "Maximum drama",
      prompt: "Will either semi-final go to penalties?",
      choices: [
        {
          id: "yes",
          label: "Absolutely",
          emoji: "🥶",
          accent: "#f59e0b",
        },
        {
          id: "no",
          label: "No chance",
          emoji: "😴",
          accent: "#8b5cf6",
        },
      ],
    },
    {
      id: "biggest-pressure",
      eyebrow: "No hiding now",
      prompt: "Which team is under the most pressure?",
      choices: [
        {
          id: "france",
          label: "France",
          emoji: "🇫🇷",
          accent: "#2563eb",
        },
        {
          id: "spain",
          label: "Spain",
          emoji: "🇪🇸",
          accent: "#ef4444",
        },
        {
          id: "england",
          label: "England",
          emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
          accent: "#f8fafc",
        },
        {
          id: "argentina",
          label: "Argentina",
          emoji: "🇦🇷",
          accent: "#60a5fa",
        },
      ],
    },
    {
      id: "best-fans",
      eyebrow: "Settle the debate",
      prompt: "Who has the best fans?",
      choices: [
        {
          id: "france",
          label: "France",
          emoji: "🇫🇷",
          accent: "#2563eb",
        },
        {
          id: "spain",
          label: "Spain",
          emoji: "🇪🇸",
          accent: "#ef4444",
        },
        {
          id: "england",
          label: "England",
          emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
          accent: "#f8fafc",
        },
        {
          id: "argentina",
          label: "Argentina",
          emoji: "🇦🇷",
          accent: "#60a5fa",
        },
      ],
    },
  ];