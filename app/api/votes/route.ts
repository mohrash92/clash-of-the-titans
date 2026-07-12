import { NextResponse } from "next/server";

import { questions } from "@/data/questions";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type VoteRequest = {
  voterId?: unknown;
  questionId?: unknown;
  choiceId?: unknown;
};

type VoteRow = {
  question_id: string;
  choice_id: string;
  vote_count: number;
};

type SubmitVoteResult = {
  accepted: boolean;
  questionId: string;
  votes: VoteRow[];
};

function isValidVote(
  questionId: string,
  choiceId: string,
): boolean {
  const question = questions.find(
    (item) => item.id === questionId,
  );

  return Boolean(
    question?.choices.some(
      (choice) => choice.id === choiceId,
    ),
  );
}

function isValidVoterId(voterId: string): boolean {
  return (
    voterId.length >= 20 &&
    voterId.length <= 100 &&
    /^[a-zA-Z0-9-]+$/.test(voterId)
  );
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("vote_totals")
    .select("question_id, choice_id, vote_count");

  if (error) {
    console.error("Unable to load votes:", error);

    return NextResponse.json(
      { error: "Unable to load vote totals." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      votes: data ?? [],
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST(request: Request) {
  let body: VoteRequest;

  try {
    body = (await request.json()) as VoteRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  if (
    typeof body.voterId !== "string" ||
    typeof body.questionId !== "string" ||
    typeof body.choiceId !== "string"
  ) {
    return NextResponse.json(
      {
        error:
          "A voter ID, question and choice are required.",
      },
      { status: 400 },
    );
  }

  if (!isValidVoterId(body.voterId)) {
    return NextResponse.json(
      { error: "Invalid voter ID." },
      { status: 400 },
    );
  }

  if (!isValidVote(body.questionId, body.choiceId)) {
    return NextResponse.json(
      { error: "Invalid question or choice." },
      { status: 400 },
    );
  }

  const { data, error } = await supabaseAdmin.rpc(
    "submit_vote",
    {
      requested_voter_id: body.voterId,
      requested_question_id: body.questionId,
      requested_choice_id: body.choiceId,
    },
  );

  if (error) {
    console.error("Unable to record vote:", error);

    return NextResponse.json(
      {
        error: "Unable to record your vote.",
        details: error.message,
      },
      { status: 500 },
    );
  }

  const result = data as SubmitVoteResult | null;

  if (!result) {
    return NextResponse.json(
      { error: "The database returned no result." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      questionId: result.questionId,
      accepted: result.accepted,
      votes: result.votes ?? [],
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}