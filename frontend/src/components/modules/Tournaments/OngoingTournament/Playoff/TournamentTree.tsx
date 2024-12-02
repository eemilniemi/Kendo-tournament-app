import React, { useEffect, useRef } from "react";
import { createBracket } from "bracketry";
import { type Match, type Tournament } from "types/models";
import { useTranslation } from "react-i18next";
import { countries } from "../../../Registeration/CountrySelect/CountrySelect";
import { useNavigate } from "react-router-dom";
import { mapNumberToLetter } from "utils/helperFunctions";

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
  const navigate = useNavigate();

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
          matches: tournament.matches?.map((match: Match) => {
            return {
              firstScorer: match.players
                .map((player) => {
                  return player.points.map((point) => ({
                    playerId: player.id,
                    timestamp: point.timestamp
                  }));
                })
                .flat()
                .sort(
                  (a, b) =>
                    new Date(a.timestamp).getTime() -
                    new Date(b.timestamp).getTime()
                )[0],
              matchId: match.id,
              tournamentId: match.tournamentId,
              courtNumber: match.courtNumber,
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
          displayWholeRounds: true,
          getNationalityHTML: (entryStatus: any) => {
            const countryCode = countries.find((country) => {
              return country.label === entryStatus.nationality;
            });
            if (countryCode === undefined) {
              return `<span 
                            title="no nationality stated"
                            style="display: inline-block;
                            width: 20px; 
                            height: 20px;
                            text-align: center;
                            line-height: 20px;">
                            ❓
                      </span>`;
            } else {
              return `<img 
              src="https://flagcdn.com/w20/${countryCode.code.toLowerCase()}.png" 
              alt="${entryStatus.nationality}" 
              title="${entryStatus.nationality}" 
              style="width: 20px; height: auto;" 
            />`;
            }
          },
          onMatchClick: (match: any) => {
            if (match.sides.length === 2) {
              navigate(
                "/tournaments/" + match.tournamentId + "/match/" + match.matchId
              );
            }
          },
          getMatchTopHTML: (match: any) => {
            // In case of BYE match don't show court number
            if (match.sides.length === 1 && match.sides[0].isWinner === true) {
              return "";
            }

            const courtLetter = mapNumberToLetter(match.courtNumber);
            return `<div 
              class="court-letter"
              title="Court: ${courtLetter}"
              style="
                font-size: 13px;
                color: DimGray;">
              
              ${t("tournament_view_labels.court_number")}: ${courtLetter}
            </div>`;
          },
          getScoresHTML: (side: any, match: any) => {
            // If side has no scores
            if (side.scores === undefined) {
              return `<div style="width: 100px;"></div>`;
            }

            // If side has the first scorer
            if (match.firstScorer.playerId === side.contestantId) {
              const pointsAsSpan = side.scores.map(
                (score: any, index: number) => {
                  if (score.mainScore === "H") {
                    score.mainScore = "Δ";
                  }
                  if (index === 0) {
                    return `<span style=
                    "width: 2em; height: 2em; box-sizing: content-box; background: #fff; border: 0.1em solid #666; text-align: center; border-radius: 50%; line-height: 2em;">
                    ${score.mainScore}
                    </span>`;
                  }
                  return `<span>${score.mainScore}</span>`;
                }
              );
              return `<div style="width: 100px; text-align: right;">${pointsAsSpan.join(
                "&nbsp;&nbsp;&nbsp;"
              )}</div>`;
            }

            // If side has scores but not the first scorer
            return `<div style="width: 100px; text-align: right;">${side.scores
              .map((score: any) => {
                if (score.mainScore === "H") {
                  score.mainScore = "Δ";
                }
                return `<span>${score.mainScore}</span>`;
              })
              .join("&nbsp;&nbsp;&nbsp;")}</div>`;
          }
        }
      );
    }
  }, [tournament.matches, t]);

  return <div ref={treeRef} />;
};

export default TreeComponent;
