import React, { useEffect, useRef } from "react";
import { createBracket } from "bracketry";
import { type Tournament } from "types/models";
import { useTranslation } from "react-i18next";

interface TournamentTreeProps {
  tournament: Tournament;
}

interface Player {
  title: string;
  nationality: string;
}

// A single player or a team
interface Contestant {
  entryStatus?: string;
  players: Player[];
}

// Counts total rounds based on the number of single players in the playoffs.
const roundsTotal = (tournament: Tournament): number => {
  function countRounds(numPlayers: number): number {
    let n: number = 2;
    let pow: number = 1;

    while (numPlayers > n) {
      n *= 2;
      ++pow;
    }

    return pow;
  }

  if (tournament.contestants !== null && tournament.contestants !== undefined) {
    const contestants: number = Object.keys(tournament.contestants).length;
    const count = countRounds(contestants);

    return count;
  }

  return 0;
};

function createContestants(tournament: Tournament): Record<string, Contestant> {
  const contestantsObject: Record<string, Contestant> = {};
  const contestantIds = Object.keys(tournament.contestants ?? {});
  console.log(
    "Starting to process the following ids: " + contestantIds.join(";")
  );

  for (const contestantId of contestantIds) {
    if (
      tournament.contestants !== undefined &&
      tournament.contestants !== null
    ) {
      const contestant = tournament.players.find(
        (player) => player.id === contestantId
      );
      console.log(
        `Processing contestant: ${contestant?.firstName} ${contestant?.lastName}`
      );

      const playersArray: Player[] = [];
      const newPlayer: Player = {
        title: contestant?.firstName + " " + contestant?.lastName,
        nationality: contestant?.nationality ?? "no nationality stated"
      };
      playersArray.push(newPlayer);

      const newContestant: Contestant = {
        entryStatus: tournament.contestants[contestantId].entryStatus,
        players: playersArray
      };

      // Add this contestant to contestantsObject
      contestantsObject[contestantId] = newContestant;
      console.log(
        `Added contestant: ${contestantsObject[contestantId].players.at(0)
          ?.title}`
      );
    } else {
      return contestantsObject;
    }
  }
  return contestantsObject;
}

const TreeComponent: React.FC<TournamentTreeProps> = ({ tournament }) => {
  const treeRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();

  // Names for each round
  function createRounds(maxRound: number): unknown[] {
    const roundNames: unknown[] = [];

    for (let i = 1; i <= maxRound; ++i) {
      if (i === maxRound) {
        roundNames.push({ name: t("tournament_view_labels.final") });
      } else if (i === maxRound - 1) {
        roundNames.push({ name: t("tournament_view_labels.semi_final") });
      } else if (i === maxRound - 2) {
        roundNames.push({ name: t("tournament_view_labels.quarter_final") });
      } else {
        roundNames.push({ name: `${t("tournament_view_labels.round")} ${i}` });
      }
    }

    return roundNames;
  }

  const contestants = createContestants(tournament);
  const maxRound = roundsTotal(tournament);
  const rounds = createRounds(maxRound);

  useEffect(() => {
    if (treeRef.current !== null) {
      createBracket(
        {
          rounds,
          matches: tournament.matches?.map((match) => {
            return {
              roundIndex: match.roundIndex,
              order: match.order,
              sides: match.sides.map((side) => {
                return {
                  title: side.title,
                  contestantId: side.contestantId,
                  scores: side.scores?.map((score) => {
                    return {
                      mainScore: score.mainScore,
                      subscore: score.subscore,
                      isWinner: score.isWinner
                    };
                  }),
                  currentServing: side.currentScore,
                  isServing: side.isServing,
                  isWinner: side.isWinner
                };
              }),
              matchStatus: match.matchStatus,
              isLive: match.isLive,
              isBronzeMatch: match.isBronzeMatch
            };
          }),
          contestants
        },
        treeRef.current,
        {
          // useClassicalLayout: true,
          navButtonsPosition: "overTitles",
          // visibleRoundsCount: 2
          displayWholeRounds: true
        }
      );
    }
  }, [tournament.matches]);

  return <div ref={treeRef} />;
};

export default TreeComponent;
