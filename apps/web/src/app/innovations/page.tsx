import InnovationList from "@/components/innovations/InnovationList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Innovations | EduFlow",
  description: "Manage your innovation projects",
};

export default function InnovationsPage() {
  return <InnovationList />;
}
