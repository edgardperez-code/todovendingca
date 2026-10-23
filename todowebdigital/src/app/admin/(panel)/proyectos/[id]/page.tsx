import { notFound } from "next/navigation";
import { ProjectEditor } from "@/components/admin/project-editor";
import { getRepo } from "@/lib/db/repo";

export default async function EditarProyectoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getRepo().getProjectById(id);
  if (!project) notFound();
  return <ProjectEditor project={project} />;
}
