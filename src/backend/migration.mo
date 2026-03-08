import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  type OldTeam = {
    id : Nat;
    name : Text;
    description : Text;
  };

  type OldRound1Score = {
    problemUnderstanding : Nat;
    innovation : Nat;
    systemDesign : Nat;
    prototypeProgress : Nat;
    teamExplanation : Nat;
    totalScore : Nat;
  };

  type OldRound2Score = {
    finalPrototype : Nat;
    technicalComplexity : Nat;
    functionality : Nat;
    uiUx : Nat;
    realWorldImpact : Nat;
    totalScore : Nat;
  };

  type OldActor = {
    teams : Map.Map<Nat, OldTeam>;
    round1Scores : Map.Map<Nat, OldRound1Score>;
    round2Scores : Map.Map<Nat, OldRound2Score>;
    nextTeamId : Nat;
  };

  type NewTeam = {
    id : Nat;
    name : Text;
    description : Text;
  };

  type NewRound1Score = {
    problemUnderstanding : Nat;
    innovation : Nat;
    systemDesign : Nat;
    prototypeProgress : Nat;
    teamExplanation : Nat;
    totalScore : Nat;
  };

  type NewRound2Score = {
    finalPrototype : Nat;
    technicalComplexity : Nat;
    functionality : Nat;
    uiUx : Nat;
    realWorldImpact : Nat;
    totalScore : Nat;
  };

  type NewActor = {
    teams : Map.Map<Nat, NewTeam>;
    round1Scores : Map.Map<Nat, NewRound1Score>;
    round2Scores : Map.Map<Nat, NewRound2Score>;
    nextTeamId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
