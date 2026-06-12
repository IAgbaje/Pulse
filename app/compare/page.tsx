import type { Metadata } from "next";
import CompareClient from "./CompareClient";

export const metadata: Metadata = {
  title: "Compare Your Salary | Pulse",
  description:
    "See where your salary ranks against anonymous Nigerian tech compensation data. Runs entirely in your browser — your number is never stored.",
};

export default function ComparePage() {
  return <CompareClient />;
}
