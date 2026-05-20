"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeletePositionButton({ id, title }: { id: string; title: string }) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/positions/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Position deleted successfully");
        router.refresh();
      } else {
        toast.error(data.error || "Failed to delete position. It may have existing applications.");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
      setConfirm(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:bg-destructive/10"
        onClick={() => setConfirm(true)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {confirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-left">
          <div className="bg-card border shadow-xl rounded-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold">Delete Position?</h3>
            <p className="text-muted-foreground text-sm">
              Are you sure you want to delete **{title}**? This action cannot be undone and will fail if there are active applications for this position.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setConfirm(false)} disabled={loading}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                {loading ? "Deleting..." : "Delete Position"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
