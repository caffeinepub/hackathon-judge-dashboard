import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Round1Score, Round2Score, Team } from "../backend.d";
import {
  useSubmitRound1Score,
  useSubmitRound2Score,
  useTeamScores,
} from "../hooks/useQueries";

interface ScoreModalProps {
  team: Team | null;
  open: boolean;
  onClose: () => void;
}

const ROUND1_FIELDS: {
  key: keyof Omit<Round1Score, "totalScore">;
  label: string;
  max: number;
}[] = [
  { key: "problemUnderstanding", label: "Problem Understanding", max: 10 },
  { key: "innovation", label: "Innovation", max: 10 },
  { key: "systemDesign", label: "System Design", max: 10 },
  { key: "prototypeProgress", label: "Prototype Progress", max: 10 },
  { key: "teamExplanation", label: "Team Explanation", max: 10 },
];

const ROUND2_FIELDS: {
  key: keyof Omit<Round2Score, "totalScore">;
  label: string;
  max: number;
}[] = [
  { key: "finalPrototype", label: "Final Prototype", max: 15 },
  { key: "technicalComplexity", label: "Technical Complexity", max: 10 },
  { key: "functionality", label: "Functionality", max: 10 },
  { key: "uiUx", label: "UI/UX", max: 5 },
  { key: "realWorldImpact", label: "Real-world Impact", max: 10 },
];

function ScoreSlider({
  label,
  max,
  value,
  onChange,
}: {
  label: string;
  max: number;
  value: number;
  onChange: (v: number) => void;
}) {
  const pct = (value / max) * 100;
  const color =
    pct >= 80
      ? "text-emerald-600"
      : pct >= 50
        ? "text-primary"
        : pct >= 30
          ? "text-amber-500"
          : "text-muted-foreground";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        <span className={`text-sm font-bold tabular-nums ${color}`}>
          {value}
          <span className="text-muted-foreground font-normal">/{max}</span>
        </span>
      </div>
      <Slider
        min={0}
        max={max}
        step={1}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
      />
    </div>
  );
}

export function ScoreModal({ team, open, onClose }: ScoreModalProps) {
  const teamId = team?.id ?? null;
  const { data: scores, isLoading: loadingScores } = useTeamScores(teamId);
  const submitR1 = useSubmitRound1Score();
  const submitR2 = useSubmitRound2Score();

  const [round1, setRound1] = useState<Record<string, number>>({
    problemUnderstanding: 0,
    innovation: 0,
    systemDesign: 0,
    prototypeProgress: 0,
    teamExplanation: 0,
  });

  const [round2, setRound2] = useState<Record<string, number>>({
    finalPrototype: 0,
    technicalComplexity: 0,
    functionality: 0,
    uiUx: 0,
    realWorldImpact: 0,
  });

  // Pre-fill when existing scores load
  useEffect(() => {
    if (!scores) return;
    const [r1, r2] = scores;
    if (r1) {
      setRound1({
        problemUnderstanding: Number(r1.problemUnderstanding),
        innovation: Number(r1.innovation),
        systemDesign: Number(r1.systemDesign),
        prototypeProgress: Number(r1.prototypeProgress),
        teamExplanation: Number(r1.teamExplanation),
      });
    }
    if (r2) {
      setRound2({
        finalPrototype: Number(r2.finalPrototype),
        technicalComplexity: Number(r2.technicalComplexity),
        functionality: Number(r2.functionality),
        uiUx: Number(r2.uiUx),
        realWorldImpact: Number(r2.realWorldImpact),
      });
    }
  }, [scores]);

  const r1Total = ROUND1_FIELDS.reduce((s, f) => s + (round1[f.key] ?? 0), 0);
  const r2Total = ROUND2_FIELDS.reduce((s, f) => s + (round2[f.key] ?? 0), 0);

  const handleSubmitR1 = async () => {
    if (!team) return;
    const score: Round1Score = {
      problemUnderstanding: BigInt(round1.problemUnderstanding),
      innovation: BigInt(round1.innovation),
      systemDesign: BigInt(round1.systemDesign),
      prototypeProgress: BigInt(round1.prototypeProgress),
      teamExplanation: BigInt(round1.teamExplanation),
      totalScore: BigInt(r1Total),
    };
    try {
      await submitR1.mutateAsync({ teamId: team.id, score });
      toast.success(`Round 1 scores saved for ${team.name}`);
    } catch {
      toast.error("Failed to save Round 1 scores");
    }
  };

  const handleSubmitR2 = async () => {
    if (!team) return;
    const score: Round2Score = {
      finalPrototype: BigInt(round2.finalPrototype),
      technicalComplexity: BigInt(round2.technicalComplexity),
      functionality: BigInt(round2.functionality),
      uiUx: BigInt(round2.uiUx),
      realWorldImpact: BigInt(round2.realWorldImpact),
      totalScore: BigInt(r2Total),
    };
    try {
      await submitR2.mutateAsync({ teamId: team.id, score });
      toast.success(`Round 2 scores saved for ${team.name}`);
    } catch {
      toast.error("Failed to save Round 2 scores");
    }
  };

  const isBusy = submitR1.isPending || submitR2.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto"
        data-ocid="score.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Score: {team?.name}
          </DialogTitle>
        </DialogHeader>

        {loadingScores ? (
          <div
            className="flex items-center justify-center py-12"
            data-ocid="score.loading_state"
          >
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="round1" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="round1" data-ocid="score.round1.tab">
                Round 1
              </TabsTrigger>
              <TabsTrigger value="round2" data-ocid="score.round2.tab">
                Round 2
              </TabsTrigger>
            </TabsList>

            <TabsContent value="round1" className="space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-sm text-muted-foreground">
                  Running Total
                </span>
                <Badge
                  variant="secondary"
                  className="font-display text-base px-3 py-1"
                >
                  <span className="font-bold text-primary">{r1Total}</span>
                  <span className="text-muted-foreground ml-1">/50</span>
                </Badge>
              </div>

              {ROUND1_FIELDS.map((field) => (
                <ScoreSlider
                  key={field.key}
                  label={field.label}
                  max={field.max}
                  value={round1[field.key] ?? 0}
                  onChange={(v) =>
                    setRound1((prev) => ({ ...prev, [field.key]: v }))
                  }
                />
              ))}

              <DialogFooter className="pt-4 flex gap-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isBusy}
                  data-ocid="score.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitR1}
                  disabled={isBusy}
                  data-ocid="score.submit_button"
                >
                  {submitR1.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Save Round 1
                </Button>
              </DialogFooter>
            </TabsContent>

            <TabsContent value="round2" className="space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-sm text-muted-foreground">
                  Running Total
                </span>
                <Badge
                  variant="secondary"
                  className="font-display text-base px-3 py-1"
                >
                  <span className="font-bold text-primary">{r2Total}</span>
                  <span className="text-muted-foreground ml-1">/50</span>
                </Badge>
              </div>

              {ROUND2_FIELDS.map((field) => (
                <ScoreSlider
                  key={field.key}
                  label={field.label}
                  max={field.max}
                  value={round2[field.key] ?? 0}
                  onChange={(v) =>
                    setRound2((prev) => ({ ...prev, [field.key]: v }))
                  }
                />
              ))}

              <DialogFooter className="pt-4 flex gap-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isBusy}
                  data-ocid="score.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitR2}
                  disabled={isBusy}
                  data-ocid="score.submit_button"
                >
                  {submitR2.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Save Round 2
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
