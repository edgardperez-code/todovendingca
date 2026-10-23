import { notFound } from "next/navigation";
import { ArticleEditor } from "@/components/admin/article-editor";
import { aiConfigured, CLAUDE_MODEL } from "@/lib/ai";
import { getRepo } from "@/lib/db/repo";

export default async function EditarArticuloPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getRepo().getPostById(id);
  if (!post) notFound();
  return <ArticleEditor post={post} aiEnabled={aiConfigured()} model={CLAUDE_MODEL} />;
}
