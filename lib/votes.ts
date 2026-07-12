export type VoteRow = {
    question_id: string;
    choice_id: string;
    vote_count: number;
  };
  
  export type VoteTotals = Record<
    string,
    Record<string, number>
  >;
  
  export function rowsToVoteTotals(
    rows: VoteRow[],
  ): VoteTotals {
    return rows.reduce<VoteTotals>((totals, row) => {
      totals[row.question_id] ??= {};
      totals[row.question_id][row.choice_id] = Number(
        row.vote_count,
      );
  
      return totals;
    }, {});
  }
  
  export function calculatePercentage(
    questionVotes: Record<string, number> | undefined,
    choiceId: string,
    numberOfChoices: number,
  ): number {
    if (!questionVotes) {
      return Math.round(100 / numberOfChoices);
    }
  
    const total = Object.values(questionVotes).reduce(
      (sum, count) => sum + count,
      0,
    );
  
    if (total === 0) {
      return Math.round(100 / numberOfChoices);
    }
  
    return Math.round(
      ((questionVotes[choiceId] ?? 0) / total) * 100,
    );
  }