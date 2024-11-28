import React, { useEffect, useRef } from "react";
import { createBracket } from "bracketry";
import { type Tournament } from "types/models";

interface TournamentTreeProps {
  tournament: Tournament;
}

interface Player {
  title: string;
  nationality: string;
}

interface Contestant {
  entryStatus?: string;
  players: Player[];
}

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

  useEffect(() => {
    if (treeRef.current !== null) {
      createBracket(
        {
          rounds: tournament.rounds?.map((n) => {
            return {
              name: n.name
            };
          }),
          matches: tournament.matches?.map((match) => {
            return {
              roundIndex: match.roundIndex,
              order: match.order,
              sides: match.sides.map((side) => {
                return {
                  title: side.title,
                  contestantId: side.contestandId,
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
          contestants: createContestants(tournament)
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
