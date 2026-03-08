import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  FileSpreadsheet,
  Plus,
  SlidersHorizontal,
  Trash2,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Team } from "../backend.d";
import { useAllTeams, useDeleteTeam } from "../hooks/useQueries";
import { AddTeamDialog } from "./AddTeamDialog";
import { ImportTeamsDialog } from "./ImportTeamsDialog";
import { ScoreModal } from "./ScoreModal";

interface TeamsPageProps {
  isAdmin: boolean;
}

export function TeamsPage({ isAdmin }: TeamsPageProps) {
  const { data: teams, isLoading, isError } = useAllTeams();
  const deleteTeam = useDeleteTeam();

  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [scoreTeam, setScoreTeam] = useState<Team | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Team | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTeam.mutateAsync(deleteTarget.id);
      toast.success(`Team "${deleteTarget.name}" removed`);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete team");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="gradient-hero rounded-2xl p-6 flex items-center gap-4 border border-border"
      >
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Users className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Teams
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage and score all participating teams
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {!isLoading && teams && (
            <Badge variant="secondary" className="font-medium hidden sm:flex">
              {teams.length} {teams.length === 1 ? "team" : "teams"}
            </Badge>
          )}
          <Button
            variant="outline"
            onClick={() => setImportOpen(true)}
            data-ocid="teams.import_button"
            className="gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
          </Button>
          <Button
            onClick={() => setAddOpen(true)}
            data-ocid="teams.add_button"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Team</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </motion.div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3" data-ocid="teams.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center"
          data-ocid="teams.error_state"
        >
          <AlertCircle className="w-6 h-6 text-destructive mx-auto mb-2" />
          <p className="text-destructive font-medium">Failed to load teams</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && (!teams || teams.length === 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-12 text-center"
          data-ocid="teams.empty_state"
        >
          <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="font-display text-lg font-semibold text-muted-foreground">
            No teams yet
          </p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Add the first team to get started.
          </p>
          <Button
            onClick={() => setAddOpen(true)}
            data-ocid="teams.add_button"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Team
          </Button>
        </motion.div>
      )}

      {/* Team list */}
      {!isLoading && !isError && teams && teams.length > 0 && (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {teams.map((team: Team, idx: number) => {
              const pos = idx + 1;
              const ocid = `teams.item.${pos}` as const;
              const deleteOcid = `teams.delete_button.${pos}` as const;
              const scoreOcid = `teams.score.button.${pos}` as const;

              return (
                <motion.div
                  key={team.id.toString()}
                  layout
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16, scale: 0.96 }}
                  transition={{ duration: 0.25, delay: idx * 0.05 }}
                  className="rounded-xl border border-border bg-card p-4 flex items-center gap-4 shadow-xs hover:border-primary/30 hover:shadow-sm transition-all"
                  data-ocid={ocid}
                >
                  {/* Avatar letter */}
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 font-display font-bold text-primary text-sm">
                    {team.name.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Team info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold font-display text-foreground truncate">
                      {team.name}
                    </p>
                    {team.description && (
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                        {team.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setScoreTeam(team)}
                      data-ocid={scoreOcid}
                      className="gap-1.5"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Score</span>
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteTarget(team)}
                        data-ocid={deleteOcid}
                        className="text-destructive hover:bg-destructive/10 hover:border-destructive/40 border-destructive/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Modals */}
      <AddTeamDialog open={addOpen} onClose={() => setAddOpen(false)} />

      <ImportTeamsDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
      />

      <ScoreModal
        team={scoreTeam}
        open={!!scoreTeam}
        onClose={() => setScoreTeam(null)}
      />

      {/* Delete confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete &ldquo;{deleteTarget?.name}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this team and all their scores. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="teams.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="teams.delete_button.confirm"
            >
              Delete Team
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
