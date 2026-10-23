import { ArticleEditor } from "@/components/admin/article-editor";
import { aiConfigured, CLAUDE_MODEL } from "@/lib/ai";

export default function NuevoArticuloPage() {
  return <ArticleEditor aiEnabled={aiConfigured()} model={CLAUDE_MODEL} />;
}
