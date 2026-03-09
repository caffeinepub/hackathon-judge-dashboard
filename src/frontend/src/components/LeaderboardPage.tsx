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
    const r1 = entry.round1Score;
    const r2 = entry.round2Score;
    return [
      idx + 1,
      `"${entry.team.name.replace(/"/g, '""')}"`,
      r1 ? Number(r1.problemUnderstanding) : 0,
      r1 ? Number(r1.innovation) : 0,
      r1 ? Number(r1.systemDesign) : 0,
      r1 ? Number(r1.prototypeProgress) : 0,
      r1 ? Number(r1.teamExplanation) : 0,
      Number(entry.round1Total),
      r2 ? Number(r2.finalPrototype) : 0,
      r2 ? Number(r2.technicalComplexity) : 0,
      r2 ? Number(r2.functionality) : 0,
      r2 ? Number(r2.uiUx) : 0,
      r2 ? Number(r2.realWorldImpact) : 0,
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

/** Compact cell showing "score/max" or "—" when not scored */
function CriteriaCell({
  value,
  max,
}: {
  value: bigint | undefined;
  max: number;
}) {
  if (value === undefined) {
    return <span className="text-muted-foreground/50 tabular-nums">—</span>;
  }
  const n = Number(value);
  const pct = (n / max) * 100;
  const colorClass =
    pct >= 80
      ? "text-emerald-600"
      : pct >= 60
        ? "text-blue-600"
        : pct >= 40
          ? "text-amber-600"
          : "text-slate-500";

  return (
    <span className={`tabular-nums text-xs font-semibold ${colorClass}`}>
      {n}
      <span className="text-muted-foreground font-normal">/{max}</span>
    </span>
  );
}

/** Total score cell with colored badge */
function TotalCell({ score, max }: { score: number; max: number }) {
  const pct = (score / max) * 100;
  const colorClass =
    pct >= 80
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : pct >= 60
        ? "bg-blue-100 text-blue-700 border-blue-200"
        : pct >= 40
          ? "bg-amber-100 text-amber-700 border-amber-200"
          : "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold tabular-nums ${colorClass}`}
    >
      {score}/{max}
    </span>
  );
}

function getRowClass(rank: number) {
  if (rank === 1) return "rank-gold border";
  if (rank === 2) return "rank-silver border";
  if (rank === 3) return "rank-bronze border";
  return "";
}

// Column group header helper
function GroupHead({
  children,
  colSpan,
  className = "",
}: {
  children: React.ReactNode;
  colSpan: number;
  className?: string;
}) {
  return (
    <TableHead
      colSpan={colSpan}
      className={`text-center text-xs font-bold uppercase tracking-wider py-1.5 border-b-0 ${className}`}
    >
      {children}
    </TableHead>
  );
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
          {/* Scrollable wrapper */}
          <div className="overflow-x-auto">
            <Table className="text-sm min-w-[900px]">
              {/* Column group headers */}
              <TableHeader>
                <TableRow className="bg-muted/60 hover:bg-muted/60">
                  {/* Rank + Team: no group label */}
                  <GroupHead colSpan={2} className="border-r border-border/60">
                    &nbsp;
                  </GroupHead>
                  {/* Round 1 group */}
                  <GroupHead
                    colSpan={6}
                    className="border-r border-border/60 text-blue-600 bg-blue-50/60"
                  >
                    Round 1 &nbsp;
                    <span className="font-normal opacity-70 normal-case">
                      (max 50)
                    </span>
                  </GroupHead>
                  {/* Round 2 group */}
                  <GroupHead
                    colSpan={6}
                    className="border-r border-border/60 text-violet-600 bg-violet-50/60"
                  >
                    Round 2 &nbsp;
                    <span className="font-normal opacity-70 normal-case">
                      (max 50)
                    </span>
                  </GroupHead>
                  {/* Combined */}
                  <GroupHead colSpan={1} className="text-primary bg-primary/5">
                    Total
                  </GroupHead>
                </TableRow>

                {/* Sub-headers */}
                <TableRow className="bg-muted/40 text-xs">
                  <TableHead className="font-semibold w-16 py-2">
                    Rank
                  </TableHead>
                  <TableHead className="font-semibold min-w-[140px] border-r border-border/60 py-2">
                    Team
                  </TableHead>

                  {/* R1 individual */}
                  <TableHead className="text-center font-medium text-blue-700 py-2 px-2 min-w-[70px]">
                    Problem
                    <br />
                    <span className="text-[10px] text-muted-foreground font-normal">
                      /10
                    </span>
                  </TableHead>
                  <TableHead className="text-center font-medium text-blue-700 py-2 px-2 min-w-[70px]">
                    Innovation
                    <br />
                    <span className="text-[10px] text-muted-foreground font-normal">
                      /10
                    </span>
                  </TableHead>
                  <TableHead className="text-center font-medium text-blue-700 py-2 px-2 min-w-[70px]">
                    System
                    <br />
                    <span className="text-[10px] text-muted-foreground font-normal">
                      /10
                    </span>
                  </TableHead>
                  <TableHead className="text-center font-medium text-blue-700 py-2 px-2 min-w-[70px]">
                    Prototype
                    <br />
                    <span className="text-[10px] text-muted-foreground font-normal">
                      /10
                    </span>
                  </TableHead>
                  <TableHead className="text-center font-medium text-blue-700 py-2 px-2 min-w-[70px]">
                    Explain
                    <br />
                    <span className="text-[10px] text-muted-foreground font-normal">
                      /10
                    </span>
                  </TableHead>
                  <TableHead className="text-center font-semibold text-blue-800 py-2 px-2 border-r border-border/60 min-w-[70px]">
                    R1 Total
                    <br />
                    <span className="text-[10px] text-muted-foreground font-normal">
                      /50
                    </span>
                  </TableHead>

                  {/* R2 individual */}
                  <TableHead className="text-center font-medium text-violet-700 py-2 px-2 min-w-[70px]">
                    Final
                    <br />
                    <span className="text-[10px] text-muted-foreground font-normal">
                      /15
                    </span>
                  </TableHead>
                  <TableHead className="text-center font-medium text-violet-700 py-2 px-2 min-w-[70px]">
                    Complexity
                    <br />
                    <span className="text-[10px] text-muted-foreground font-normal">
                      /10
                    </span>
                  </TableHead>
                  <TableHead className="text-center font-medium text-violet-700 py-2 px-2 min-w-[70px]">
                    Function
                    <br />
                    <span className="text-[10px] text-muted-foreground font-normal">
                      /10
                    </span>
                  </TableHead>
                  <TableHead className="text-center font-medium text-violet-700 py-2 px-2 min-w-[60px]">
                    UI/UX
                    <br />
                    <span className="text-[10px] text-muted-foreground font-normal">
                      /5
                    </span>
                  </TableHead>
                  <TableHead className="text-center font-medium text-violet-700 py-2 px-2 min-w-[70px]">
                    Impact
                    <br />
                    <span className="text-[10px] text-muted-foreground font-normal">
                      /10
                    </span>
                  </TableHead>
                  <TableHead className="text-center font-semibold text-violet-800 py-2 px-2 border-r border-border/60 min-w-[70px]">
                    R2 Total
                    <br />
                    <span className="text-[10px] text-muted-foreground font-normal">
                      /50
                    </span>
                  </TableHead>

                  {/* Combined */}
                  <TableHead className="text-center font-bold text-primary py-2 px-2 min-w-[80px]">
                    Combined
                    <br />
                    <span className="text-[10px] text-muted-foreground font-normal">
                      /100
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sorted.map((entry: LeaderboardEntry, idx: number) => {
                  const rank = idx + 1;
                  const r1 = entry.round1Score;
                  const r2 = entry.round2Score;
                  const total = Number(entry.combinedTotal);
                  const ocid = `leaderboard.row.${rank}` as const;

                  return (
                    <TableRow
                      key={entry.team.id.toString()}
                      className={`transition-colors ${getRowClass(rank)}`}
                      data-ocid={ocid}
                    >
                      {/* Rank */}
                      <TableCell className="py-2.5 px-3">
                        <RankBadge rank={rank} />
                      </TableCell>

                      {/* Team */}
                      <TableCell className="py-2.5 border-r border-border/40">
                        <div>
                          <p className="font-semibold font-display text-foreground text-sm leading-tight">
                            {entry.team.name}
                          </p>
                          {entry.team.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {entry.team.description}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* R1 criteria */}
                      <TableCell className="text-center py-2.5 px-2">
                        <CriteriaCell
                          value={r1?.problemUnderstanding}
                          max={10}
                        />
                      </TableCell>
                      <TableCell className="text-center py-2.5 px-2">
                        <CriteriaCell value={r1?.innovation} max={10} />
                      </TableCell>
                      <TableCell className="text-center py-2.5 px-2">
                        <CriteriaCell value={r1?.systemDesign} max={10} />
                      </TableCell>
                      <TableCell className="text-center py-2.5 px-2">
                        <CriteriaCell value={r1?.prototypeProgress} max={10} />
                      </TableCell>
                      <TableCell className="text-center py-2.5 px-2">
                        <CriteriaCell value={r1?.teamExplanation} max={10} />
                      </TableCell>
                      <TableCell className="text-center py-2.5 px-2 border-r border-border/40">
                        <TotalCell score={Number(entry.round1Total)} max={50} />
                      </TableCell>

                      {/* R2 criteria */}
                      <TableCell className="text-center py-2.5 px-2">
                        <CriteriaCell value={r2?.finalPrototype} max={15} />
                      </TableCell>
                      <TableCell className="text-center py-2.5 px-2">
                        <CriteriaCell
                          value={r2?.technicalComplexity}
                          max={10}
                        />
                      </TableCell>
                      <TableCell className="text-center py-2.5 px-2">
                        <CriteriaCell value={r2?.functionality} max={10} />
                      </TableCell>
                      <TableCell className="text-center py-2.5 px-2">
                        <CriteriaCell value={r2?.uiUx} max={5} />
                      </TableCell>
                      <TableCell className="text-center py-2.5 px-2">
                        <CriteriaCell value={r2?.realWorldImpact} max={10} />
                      </TableCell>
                      <TableCell className="text-center py-2.5 px-2 border-r border-border/40">
                        <TotalCell score={Number(entry.round2Total)} max={50} />
                      </TableCell>

                      {/* Combined */}
                      <TableCell className="text-center py-2.5 px-2">
                        <TotalCell score={total} max={100} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Scroll hint for mobile */}
          <div className="sm:hidden px-4 py-2 border-t border-border/40 bg-muted/30">
            <p className="text-xs text-muted-foreground text-center">
              ← Scroll horizontally to see all scores →
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
