# NBA 2K25 Build Audit

**Stop guessing. Detect dead zones and missing animations before you spend 450k VC.**

This application helps NBA 2K25 players optimize their MyPlayer builds by auditing their stats against critical "Meta Animation" requirements. It identifies wasted attributes, missing thresholds for elite animations, and potential "Cap Breaker" opportunities.

## Features

-   **Stat Input**: Configure your build's Finishing, Shooting, Playmaking, and Defense stats.
-   **Real-time Audit**: Instantly checks your stats against a database of essential animation requirements (e.g., Elite Contact Dunks, Jamal Murray Behind Back, Gold Limitless Range).
-   **Cost Calculation**: Estimates the VC cost of your build based on the "score" of your selected stats.
-   **Safety Status**: Visual feedback indicating if your build is "OPTIMIZED" or "RISKY" based on missed thresholds.
-   **Cap Breaker Simulation**: Simulate the effect of "+5" Cap Breakers to see what future animations you could unlock.
-   **Critical Warnings**: Alerts you to "Dead Zones" where you are paying for stats but missing the next tier of animations.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How to Use

1.  **Enter Stats**: Use the sliders or +/- buttons to input your potential build's stats in the Finishing, Shooting, Playmaking, and Defense categories.
2.  **Run Audit**: Click the "Run Audit" button.
3.  **Review Results**:
    *   **Scorecard**: Check the estimated cost and safety status.
    *   **Critical Warnings**: Look for red alerts. These tell you if you are just a few points shy of a major animation (e.g., having an 85 Driving Dunk when 87 unlocks Pro Contact Dunks).
    *   **Successes**: See what elite animations your build qualifies for.
4.  **Simulate Cap Breakers**: Toggle "Simulate Cap Breakers" to see if a +5 boost to your stats would unlock significantly better animations.

## Tech Stack

-   [Next.js](https://nextjs.org)
-   [React](https://react.dev)
-   [Tailwind CSS](https://tailwindcss.com)
-   [Lucide React](https://lucide.dev) (Icons)
