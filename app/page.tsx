import seedData from "@/data/seed.json";
import { getInsights, CompensationRecord } from "@/lib/data";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SalaryByLevel from "@/components/SalaryByLevel";
import IndustryBreakdown from "@/components/IndustryBreakdown";
import Insights from "@/components/Insights";
import CompareYourself from "@/components/CompareYourself";
import Contribute from "@/components/Contribute";
import Methodology from "@/components/Methodology";
import Footer from "@/components/Footer";

export default function Home() {
  const data = seedData as CompensationRecord[];
  const insights = getInsights(data);

  return (
    <main className="min-h-screen bg-[#081C0F]">
      <Navbar />
      <Hero insights={insights} />
      <SalaryByLevel insights={insights} />
      <IndustryBreakdown insights={insights} />
      <Insights />
      <CompareYourself data={data} />
      <Contribute />
      <Methodology totalRecords={data.length} />
      <Footer />
    </main>
  );
}
