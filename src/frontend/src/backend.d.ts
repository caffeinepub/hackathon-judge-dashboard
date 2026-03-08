import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Round2Score {
    realWorldImpact: bigint;
    technicalComplexity: bigint;
    uiUx: bigint;
    finalPrototype: bigint;
    totalScore: bigint;
    functionality: bigint;
}
export interface Round1Score {
    problemUnderstanding: bigint;
    systemDesign: bigint;
    innovation: bigint;
    prototypeProgress: bigint;
    totalScore: bigint;
    teamExplanation: bigint;
}
export interface LeaderboardEntry {
    combinedTotal: bigint;
    round1Total: bigint;
    team: Team;
    round2Total: bigint;
}
export interface UserProfile {
    name: string;
}
export interface Team {
    id: bigint;
    name: string;
    description: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addTeam(name: string, description: string): Promise<bigint>;
    addTeams(names: Array<string>): Promise<Array<bigint>>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteTeam(teamId: bigint): Promise<void>;
    getAllTeams(): Promise<Array<Team>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLeaderboard(): Promise<Array<LeaderboardEntry>>;
    getTeamScores(teamId: bigint): Promise<[Round1Score | null, Round2Score | null]>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitRound1Score(teamId: bigint, score: Round1Score): Promise<void>;
    submitRound2Score(teamId: bigint, score: Round2Score): Promise<void>;
}
