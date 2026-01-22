import InnovationForm from "@/components/innovations/InnovationForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";

export const metadata = {
  title: "Create Innovation | EduFlow",
  description: "Submit a new innovation proposal",
};

export default function CreateInnovationPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <Link href="/innovations" className="w-fit">
          <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-blue-600 transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Innovations
          </Button>
        </Link>
        
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-blue-600" />
            Submit New Innovation
          </h1>
          <p className="text-gray-600 text-lg mt-2">
            Share your groundbreaking ideas with the community
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl p-6 md:p-10">
        <InnovationForm />
      </div>
    </div>
  );
}
