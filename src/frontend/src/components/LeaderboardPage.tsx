import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Award, BarChart3, Download, Medal, Trophy } from "lucide-react";
import { motion } from "motion/react";
import type { LeaderboardEntry } from "../backend.d";
import { useLeaderboard } from "../hooks/useQueries";

function downloadCSV(entries: LeaderboardEntry[]) {
  const sorted = [...entries].sort(
    (a, b) => Number(b.combinedTotal) - Number(a.combinedTotal),
  );

  const headers = [
    "Rank",
    "Team Name",
    // Round 1
    "R1 - Problem Understanding (/10)",
    "R1 - Innovation (/10)",
    "R1 - System Design (/10)",
    "R1 - Prototype Progress (/10)",
    "R1 - Team Explanation (/10)",
    "Round 1 Total (/50)",
    // Round 2
    "R2 - Final Prototype (/15)",
    "R2 - Technical Complexity (/10)",
    "R2 - Functionality (/10)",
    "R2 - UI/UX (/5)",
    "R2 - Real-world Impact (/10)",
    "Round 2 Total (/50)",
    // Overall
    "Combined Total (/100)",
  ];

  const rows = sorted.map((entry, idx) => {
    const r1 = (
      entry as LeaderboardEntry & { round1Score?: Record<string, bigint> }
    ).round1Score;
    const r2 = (
      entry as LeaderboardEntry & { round2Score?: Record<string, bigint> }
    ).round2Score;
    return [
      idx + 1,
      `"${entry.team.name.replace(/"/g, '""')}"`,
      r1 ? Number(r1.problemUnderstanding ?? 0) : 0,
      r1 ? Number(r1.innovation ?? 0) : 0,
      r1 ? Number(r1.systemDesign ?? 0) : 0,
      r1 ? Number(r1.prototypeProgress ?? 0) : 0,
      r1 ? Number(r1.teamExplanation ?? 0) : 0,
      Number(entry.round1Total),
      r2 ? Number(r2.finalPrototype ?? 0) : 0,
      r2 ? Number(r2.technicalComplexity ?? 0) : 0,
      r2 ? Number(r2.functionality ?? 0) : 0,
      r2 ? Number(r2.uiUx ?? 0) : 0,
      r2 ? Number(r2.realWorldImpact ?? 0) : 0,
      Number(entry.round2Total),
      Number(entry.combinedTotal),
    ].join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hackathon-scores-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <div className="flex items-center gap-1.5">
        <Trophy className="w-4 h-4 text-amber-500" />
        <span className="font-bold text-amber-600">1st</span>
      </div>
    );
  if (rank === 2)
    return (
      <div className="flex items-center gap-1.5">
        <Medal className="w-4 h-4 text-slate-400" />
        <span className="font-bold text-slate-500">2nd</span>
      </div>
    );
  if (rank === 3)
    return (
      <div className="flex items-center gap-1.5">
        <Award className="w-4 h-4 text-amber-700" />
        <span className="font-bold text-amber-700">3rd</span>
      </div>
    );
  return (
    <span className="font-medium text-muted-foreground tabular-nums">
      #{rank}
    </span>
  );
}

function ScoreBadge({
  score,
  max,
  variant = "default",
}: {
  score: number;
  max: number;
  variant?: "r1" | "r2" | "default";
}) {
  const pct = (score / max) * 100;
  const colorClass =
    pct >= 80
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : pct >= 60
        ? "bg-blue-100 text-blue-700 border-blue-200"
        : pct >= 40
          ? "bg-amber-100 text-amber-700 border-amber-200"
          : "bg-slate-100 text-slate-600 border-slate-200";

  if (variant === "default") {
    return (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-semibold tabular-nums ${colorClass}`}
      >
        {score}/{max}
      </span>
    );
  }

  return (
    <span className="text-sm tabular-nums font-medium text-foreground">
      {score}
      <span className="text-muted-foreground">/{max}</span>
    </span>
  );
}

function getRowClass(rank: number) {
  if (rank === 1) return "rank-gold border";
  if (rank === 2) return "rank-silver border";
  if (rank === 3) return "rank-bronze border";
  return "";
}

export function LeaderboardPage() {
  const { data: entries, isLoading, isError } = useLeaderboard();

  const sorted = [...(entries ?? [])].sort(
    (a, b) => Number(b.combinedTotal) - Number(a.combinedTotal),
  );

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
          <BarChart3 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Leaderboard
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Live standings — combined scores from both rounds
          </p>
        </div>
        {!isLoading && sorted.length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="secondary" className="font-medium hidden sm:flex">
              {sorted.length} {sorted.length === 1 ? "team" : "teams"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadCSV(sorted)}
              data-ocid="leaderboard.download.button"
              className="gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download CSV</span>
              <span className="sm:hidden">CSV</span>
            </Button>
          </div>
        )}
      </motion.div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3" data-ocid="leaderboard.loading_state">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-destructive"
          data-ocid="leaderboard.error_state"
        >
          Failed to load leaderboard. Please try again.
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && sorted.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-12 text-center"
          data-ocid="leaderboard.empty_state"
        >
          <Trophy className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="font-display text-lg font-semibold text-muted-foreground">
            No scores yet
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Add teams and start scoring to see the leaderboard.
          </p>
        </motion.div>
      )}

      {/* Table */}
      {!isLoading && !isError && sorted.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-xl border border-border overflow-hidden bg-card shadow-xs"
          data-ocid="leaderboard.table"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-20 font-semibold">Rank</TableHead>
                <TableHead className="font-semibold">Team</TableHead>
                <TableHead className="text-center font-semibold hidden sm:table-cell">
                  Round 1 (/50)
                </TableHead>
                <TableHead className="text-center font-semibold hidden sm:table-cell">
                  Round 2 (/50)
                </TableHead>
                <TableHead className="text-center font-semibold">
                  Total (/100)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((entry: LeaderboardEntry, idx: number) => {
                const rank = idx + 1;
                const r1 = Number(entry.round1Total);
                const r2 = Number(entry.round2Total);
                const total = Number(entry.combinedTotal);
                const ocid = `leaderboard.row.${rank}` as const;

                return (
                  <TableRow
                    key={entry.team.id.toString()}
                    className={`transition-colors ${getRowClass(rank)}`}
                    data-ocid={ocid}
                  >
                    <TableCell className="py-4">
                      <RankBadge rank={rank} />
                    </TableCell>
                    <TableCell className="py-4">
                      <div>
                        <p className="font-semibold font-display text-foreground">
                          {entry.team.name}
                        </p>
                        {entry.team.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {entry.team.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center hidden sm:table-cell py-4">
                      <ScoreBadge score={r1} max={50} variant="r1" />
                    </TableCell>
                    <TableCell className="text-center hidden sm:table-cell py-4">
                      <ScoreBadge score={r2} max={50} variant="r2" />
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <ScoreBadge score={total} max={100} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </motion.div>
      )}
    </div>
  );
}
