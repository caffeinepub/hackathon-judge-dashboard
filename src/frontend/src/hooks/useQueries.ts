import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Round1Score, Round2Score } from "../backend.d";
import { useActor } from "./useActor";

// ── Queries ──────────────────────────────────────────────────────────────────

export function useAllTeams() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTeams();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLeaderboard() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTeamScores(teamId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["teamScores", teamId?.toString()],
    queryFn: async () => {
      if (!actor || teamId === null)
        return [null, null] as [Round1Score | null, Round2Score | null];
      return actor.getTeamScores(teamId);
    },
    enabled: !!actor && !isFetching && teamId !== null,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Mutations ────────────────────────────────────────────────────────────────

export function useAddTeam() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      description,
    }: { name: string; description: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addTeam(name, description);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["teams"] });
      void queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

export function useAddTeams() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (names: string[]) => {
      if (!actor) throw new Error("Not connected");
      return actor.addTeams(names);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["teams"] });
      void queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

export function useDeleteTeam() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (teamId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteTeam(teamId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["teams"] });
      void queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

export function useSubmitRound1Score() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      teamId,
      score,
    }: { teamId: bigint; score: Round1Score }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitRound1Score(teamId, score);
    },
    onSuccess: (_data, { teamId }) => {
      void queryClient.invalidateQueries({
        queryKey: ["teamScores", teamId.toString()],
      });
      void queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

export function useSubmitRound2Score() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      teamId,
      score,
    }: { teamId: bigint; score: Round2Score }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitRound2Score(teamId, score);
    },
    onSuccess: (_data, { teamId }) => {
      void queryClient.invalidateQueries({
        queryKey: ["teamScores", teamId.toString()],
      });
      void queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}
