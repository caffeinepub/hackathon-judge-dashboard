import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Specify data migration function in with-clause

actor {
  // Persistent state
  let teams = Map.empty<Nat, Team>();
  let round1Scores = Map.empty<Nat, Round1Score>();
  let round2Scores = Map.empty<Nat, Round2Score>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextTeamId = 1;

  // Authorization state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Data Types
  public type UserProfile = {
    name : Text;
  };

  public type Team = {
    id : Nat;
    name : Text;
    description : Text;
  };

  module Team {
    public func compare(a : Team, b : Team) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  public type Round1Score = {
    problemUnderstanding : Nat;
    innovation : Nat;
    systemDesign : Nat;
    prototypeProgress : Nat;
    teamExplanation : Nat;
    totalScore : Nat;
  };

  public type Round2Score = {
    finalPrototype : Nat;
    technicalComplexity : Nat;
    functionality : Nat;
    uiUx : Nat;
    realWorldImpact : Nat;
    totalScore : Nat;
  };

  type LeaderboardEntry = {
    team : Team;
    round1Total : Nat;
    round2Total : Nat;
    combinedTotal : Nat;
  };

  module LeaderboardEntry {
    public func compare(a : LeaderboardEntry, b : LeaderboardEntry) : Order.Order {
      Nat.compare(b.combinedTotal, a.combinedTotal);
    };
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Team Management
  public shared ({ caller }) func addTeam(name : Text, description : Text) : async Nat {
    let teamId = nextTeamId;
    let team : Team = {
      id = teamId;
      name;
      description;
    };
    teams.add(teamId, team);
    nextTeamId += 1;
    teamId;
  };

  public shared ({ caller }) func addTeams(names : [Text]) : async [Nat] {
    let filteredNames = names.filter(func(name) { name != "" });
    let newTeamIds = filteredNames.map(
      func(name) {
        let teamId = nextTeamId;
        let team : Team = {
          id = teamId;
          name;
          description = "";
        };
        teams.add(teamId, team);
        nextTeamId += 1;
        teamId;
      }
    );
    newTeamIds;
  };

  public shared ({ caller }) func deleteTeam(teamId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete teams");
    };
    if (not teams.containsKey(teamId)) {
      Runtime.trap("Team does not exist");
    };
    teams.remove(teamId);
    round1Scores.remove(teamId);
    round2Scores.remove(teamId);
  };

  public query func getAllTeams() : async [Team] {
    let teamsIter = teams.values();
    let teamsArray = teamsIter.toArray();
    teamsArray.sort();
  };

  // Scoring Management
  public shared ({ caller }) func submitRound1Score(teamId : Nat, score : Round1Score) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can submit scores");
    };
    if (not teams.containsKey(teamId)) {
      Runtime.trap("Team does not exist");
    };
    round1Scores.add(teamId, score);
  };

  public shared ({ caller }) func submitRound2Score(teamId : Nat, score : Round2Score) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can submit scores");
    };
    if (not teams.containsKey(teamId)) {
      Runtime.trap("Team does not exist");
    };
    round2Scores.add(teamId, score);
  };

  public query func getTeamScores(teamId : Nat) : async (?Round1Score, ?Round2Score) {
    if (not teams.containsKey(teamId)) {
      Runtime.trap("Team does not exist");
    };
    (round1Scores.get(teamId), round2Scores.get(teamId));
  };

  // Leaderboard
  public query func getLeaderboard() : async [LeaderboardEntry] {
    let entries = teams.entries().toArray();
    let leaderboard = entries.map(
      func((teamId, team)) : LeaderboardEntry {
        let round1Total = switch (round1Scores.get(teamId)) {
          case (null) { 0 };
          case (?score) { score.totalScore };
        };
        let round2Total = switch (round2Scores.get(teamId)) {
          case (null) { 0 };
          case (?score) { score.totalScore };
        };
        {
          team;
          round1Total;
          round2Total;
          combinedTotal = round1Total + round2Total;
        };
      }
    );
    leaderboard.sort();
  };
};
