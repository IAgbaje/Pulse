import type { Metadata } from "next";
import { getAllData } from "@/lib/server-data";
import { getFilterOptions } from "@/lib/data";
import CompareClient from "./CompareClient";

export const metadata: Metadata = {
  title: "Compare Your Salary | Pulse",
  description:
    "See where your salary ranks against anonymous Nigerian tech compensation data. Runs entirely in your browser. Your number is never stored.",
};

export default async function ComparePage() {
  const data = await getAllData();
  const opts = getFilterOptions(data);
  return (
    <CompareClient
      totalCount={data.length}
      industries={opts.industries}
    />
  );
}
