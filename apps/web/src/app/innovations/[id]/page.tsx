import InnovationDetail from "@/components/innovations/InnovationDetail";

export default function InnovationDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8 px-4">
      <InnovationDetail id={params.id} />
    </div>
  );
}
