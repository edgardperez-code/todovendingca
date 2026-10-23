"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { api } from "@/lib/client-api";

export function DeleteLeadButton({ id }: { id: string }) {
  const router = useRouter();
  async function remove() {
    if (!confirm("¿Eliminar este contacto?")) return;
    await api(`/api/admin/leads/${id}`, { method: "DELETE" });
    router.refresh();
  }
  return (
    <button type="button" onClick={remove} className="rounded-lg p-2 text-ink-400 hover:bg-red-50 hover:text-red-600" aria-label="Eliminar contacto"><Trash2 className="h-4 w-4" /></button>
  );
}
