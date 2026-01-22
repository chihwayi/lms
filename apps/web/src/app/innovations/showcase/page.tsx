import InnovationShowcase from "@/components/innovations/InnovationShowcase";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Innovation Showcase | EduFlow",
  description: "Explore student innovation projects",
};

export default function ShowcasePage() {
  return (
    <div className="space-y-6">
      <Link href="/innovations" className="inline-block">
        <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-blue-600 transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Innovations
        </Button>
      </Link>
      <InnovationShowcase />
    </div>
  );
}
