import type { Metadata } from "next";
import ExploreClient from "./ExploreClient";

export const metadata: Metadata = {
  title: "Salary Explorer | Pulse",
  description:
    "Filter anonymous Nigerian tech salary data by year, level, industry, location, and company stage.",
};

export default function ExplorePage() {
  return <ExploreClient />;
}
