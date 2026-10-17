import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { SEED_EXAMS, Exam } from "@/lib/exam-data";
import { NextRequest, NextResponse } from "next/server";

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}
function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("exams")
      .select("*, exam_questions(count), exam_registrations(count)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      return NextResponse.json(data);
    }
  }

  // Fallback if DB not connected
  return NextResponse.json(SEED_EXAMS);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();

  const { questions, ...body } = await req.json();
  const base = body.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const slug = base || `exam-${Date.now()}`;

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("exams")
      .insert({ ...body, slug })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (questions && Array.isArray(questions) && questions.length > 0) {
      const formatted = questions.map((q: any, idx: number) => ({
        exam_id: data.id,
        question_text: q.question_text,
        options: q.options,
        correct_option: q.correct_option ?? 0,
        marks: q.marks || 1,
        explanation: q.explanation || "",
        order_index: idx + 1,
      }));
      await supabase.from("exam_questions").insert(formatted);
    }

    return NextResponse.json(data);
  }

  // Local fallback response
  const newExam: Exam = {
    id: `exam-${Date.now()}`,
    title: body.title,
    slug,
    description: body.description || "",
    category: body.category || "General",
    duration_minutes: body.duration_minutes || 30,
    total_marks: body.total_marks || 100,
    passing_percentage: body.passing_percentage || 40,
    instructions: body.instructions || "",
    is_active: body.is_active ?? true,
    created_at: new Date().toISOString(),
    question_count: questions?.length || 0,
  };
  SEED_EXAMS.unshift(newExam);
  if (questions && questions.length > 0) {
    SEED_QUESTIONS[newExam.id] = questions.map((q: any, idx: number) => ({
      ...q,
      id: `q-${newExam.id}-${idx}`,
      exam_id: newExam.id,
      order_index: idx + 1,
    }));
  }
  return NextResponse.json(newExam);
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();

  const { id, ...updates } = await req.json();
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("exams")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  return NextResponse.json({ id, ...updates, success: true });
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();

  const { id } = await req.json();
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("exams").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
