import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAddTeams } from "../hooks/useQueries";

interface ImportTeamsDialogProps {
  open: boolean;
  onClose: () => void;
}

function parseTeamNames(raw: string): string[] {
  const lines = raw.split("\n");
  const names: string[] = [];
  for (const line of lines) {
    const parts = line.split(",");
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed) names.push(trimmed);
    }
  }
  // Deduplicate while preserving order
  const seen = new Set<string>();
  return names.filter((n) => {
    const key = n.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function ImportTeamsDialog({ open, onClose }: ImportTeamsDialogProps) {
  const [raw, setRaw] = useState("");
  const addTeams = useAddTeams();

  const parsedNames = useMemo(() => parseTeamNames(raw), [raw]);

  const handleClose = () => {
    setRaw("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedNames.length === 0) return;
    try {
      await addTeams.mutateAsync(parsedNames);
      toast.success(
        `${parsedNames.length} team${parsedNames.length > 1 ? "s" : ""} imported!`,
      );
      handleClose();
    } catch {
      toast.error("Failed to import teams");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md" data-ocid="import_teams.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Import Teams
          </DialogTitle>
          <DialogDescription>
            Paste team names — one per line or comma-separated. Duplicates will
            be removed automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="import-names">Team Names</Label>
            <Textarea
              id="import-names"
              placeholder={"Team Alpha\nTeam Beta, Team Gamma\nTeam Delta"}
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              rows={6}
              data-ocid="import_teams.textarea"
              className="font-mono text-sm resize-none"
            />
          </div>

          {/* Preview */}
          {parsedNames.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Preview — {parsedNames.length} team
                {parsedNames.length !== 1 ? "s" : ""}
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto rounded-lg border border-border bg-muted/30 p-2.5">
                {parsedNames.map((name) => (
                  <Badge
                    key={name}
                    variant="secondary"
                    className="text-xs font-medium"
                  >
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={addTeams.isPending}
              data-ocid="import_teams.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addTeams.isPending || parsedNames.length === 0}
              data-ocid="import_teams.submit_button"
            >
              {addTeams.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 mr-2" />
              )}
              Import {parsedNames.length > 0 ? parsedNames.length : ""} Team
              {parsedNames.length !== 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
