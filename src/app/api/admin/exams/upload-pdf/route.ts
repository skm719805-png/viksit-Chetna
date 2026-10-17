import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPdfBuffer, parseQuestionsFromText } from "@/lib/pdf-parser";

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const directText = formData.get("text") as string | null;

    let extractedText = "";
    let suggestedTitle = "Generated MCQ Examination";

    if (file && file.size > 0) {
      suggestedTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      extractedText = extractTextFromPdfBuffer(buffer);
    } else if (directText && directText.trim()) {
      extractedText = directText;
    } else {
      return NextResponse.json({ error: "No PDF file or text provided." }, { status: 400 });
    }

    if (!extractedText || extractedText.trim().length < 10) {
      return NextResponse.json(
        { error: "Could not extract readable text from this PDF. Please ensure it contains selectable text, or paste the questions directly." },
        { status: 422 }
      );
    }

    const questions = parseQuestionsFromText(extractedText);

    if (questions.length === 0) {
      return NextResponse.json(
        {
          error: "No MCQs were automatically detected. Please check the PDF formatting or paste question text in format: 1. Question? A) ... B) ... C) ... D) ... Ans: B",
          rawTextPreview: extractedText.substring(0, 500),
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      title: suggestedTitle,
      extractedCount: questions.length,
      questions,
      rawTextLength: extractedText.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process PDF" }, { status: 500 });
  }
}
