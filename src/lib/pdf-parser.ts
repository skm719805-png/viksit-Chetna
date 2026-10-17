import zlib from "zlib";

export interface ParsedQuestion {
  id: string;
  question_text: string;
  options: string[];
  correct_option: number; // 0 for A, 1 for B, 2 for C, 3 for D
  marks: number;
  explanation?: string;
}

/**
 * Extracts plain text from a raw PDF buffer without external dependencies.
 * Uses Node.js zlib to inflate FlateDecode streams and parses PDF text operators.
 */
export function extractTextFromPdfBuffer(buffer: Buffer): string {
  const binaryString = buffer.toString("binary");
  const textChunks: string[] = [];

  // Locate all stream ... endstream blocks in PDF
  const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
  let match: RegExpExecArray | null;

  while ((match = streamRegex.exec(binaryString)) !== null) {
    const streamContent = match[1];
    let decompressed: string | null = null;

    try {
      // Convert stream slice to buffer for zlib inflation
      const streamBuf = Buffer.from(streamContent, "binary");
      const inflated = zlib.inflateSync(streamBuf);
      decompressed = inflated.toString("utf-8");
    } catch {
      try {
        const streamBuf = Buffer.from(streamContent, "binary");
        const inflated = zlib.unzipSync(streamBuf);
        decompressed = inflated.toString("utf-8");
      } catch {
        // Uncompressed stream
        decompressed = streamContent;
      }
    }

    if (decompressed) {
      // Extract text inside PDF text blocks BT ... ET
      const btEtRegex = /BT([\s\S]*?)ET/g;
      let btMatch: RegExpExecArray | null;

      while ((btMatch = btEtRegex.exec(decompressed)) !== null) {
        const textBlock = btMatch[1];
        // Parse (string) Tj or [(array of string/number)] TJ
        const tjRegex = /(?:\(([^()]*)\)\s*Tj|\[([^\]]*)\]\s*TJ)/g;
        let tjMatch: RegExpExecArray | null;

        while ((tjMatch = tjRegex.exec(textBlock)) !== null) {
          if (tjMatch[1] !== undefined) {
            textChunks.push(cleanPdfString(tjMatch[1]));
          } else if (tjMatch[2] !== undefined) {
            const arrContent = tjMatch[2];
            const strInArr = /\(([^()]*)\)/g;
            let strMatch: RegExpExecArray | null;
            const subStrs: string[] = [];
            while ((strMatch = strInArr.exec(arrContent)) !== null) {
              subStrs.push(cleanPdfString(strMatch[1]));
            }
            if (subStrs.length > 0) {
              textChunks.push(subStrs.join(""));
            }
          }
        }
        textChunks.push("\n");
      }
    }
  }

  const result = textChunks.join(" ").replace(/[ \t]+/g, " ").replace(/\n\s*\n/g, "\n");
  if (result.trim().length > 30) {
    return result;
  }

  // Fallback: extract ASCII text sequences from binary buffer
  const rawAscii = buffer.toString("ascii");
  const readable = rawAscii.match(/[A-Za-z0-9\s.,?!:;()/'"-]{5,}/g);
  return readable ? readable.join("\n") : "";
}

function cleanPdfString(str: string): string {
  return str
    .replace(/\\([0-7]{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\([\\()])/g, "$1");
}

/**
 * Intelligent MCQ Parser:
 * Identifies question patterns, choices (A, B, C, D), answer keys, and explanations.
 */
export function parseQuestionsFromText(rawText: string): ParsedQuestion[] {
  if (!rawText || !rawText.trim()) return [];

  const normalized = rawText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  // Regex to split by questions like: 1. or Q1. or Question 1: or 1)
  const questionSplitter = /(?:\n|^)\s*(?:Q(?:uestion)?\.?\s*(\d+)|\((\d+)\)|(\d+)[\.\)])\s+/gi;

  const matches: { index: number; qNum: string }[] = [];
  let m: RegExpExecArray | null;

  while ((m = questionSplitter.exec(normalized)) !== null) {
    const qNum = m[1] || m[2] || m[3];
    matches.push({ index: m.index, qNum });
  }

  const rawBlocks: string[] = [];
  if (matches.length > 0) {
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index;
      const end = i < matches.length - 1 ? matches[i + 1].index : normalized.length;
      rawBlocks.push(normalized.substring(start, end).trim());
    }
  } else {
    // If no numbered prefix, split by double newlines
    const paragraphs = normalized.split(/\n\s*\n/).filter((p) => p.trim().length > 15);
    rawBlocks.push(...paragraphs);
  }

  const questions: ParsedQuestion[] = [];

  rawBlocks.forEach((block, idx) => {
    // Extract Answer Key if present in block:
    // e.g. Ans: B, Answer: (C), Key: A, Correct: D
    let correctOption = 0; // default to A
    let explanation = "";

    const ansMatch = block.match(/(?:Ans(?:wer)?|Key|Correct(?:\s+Option)?)\s*[:=-]?\s*\(?([A-Da-d1-4])\)?/i);
    if (ansMatch) {
      const letter = ansMatch[1].toUpperCase();
      if (letter === "A" || letter === "1") correctOption = 0;
      else if (letter === "B" || letter === "2") correctOption = 1;
      else if (letter === "C" || letter === "3") correctOption = 2;
      else if (letter === "D" || letter === "4") correctOption = 3;
    }

    const expMatch = block.match(/(?:Explanation|Reason|Solution)\s*[:=-]?\s*([^\n]+(?:\n[^\n]+)*)/i);
    if (expMatch) {
      explanation = expMatch[1].trim();
    }

    // Strip out the answer & explanation line from the main text before extracting options
    let cleanBlock = block
      .replace(/(?:Ans(?:wer)?|Key|Correct(?:\s+Option)?)\s*[:=-]?\s*\(?([A-Da-d1-4])\)?/gi, "")
      .replace(/(?:Explanation|Reason|Solution)\s*[:=-]?\s*([^\n]+(?:\n[^\n]+)*)/gi, "")
      .trim();

    // Strip leading question number (e.g. "1. " or "Q1: ")
    cleanBlock = cleanBlock.replace(/^(?:Q(?:uestion)?\.?\s*\d+|\(\d+\)|\d+[\.\)])\s*/i, "");

    // Split options:
    // Look for (A) / A) / A. / [A]
    const optionMatches: { letter: string; index: number; text: string }[] = [];
    const optRegex = /(?:\n|^|\s+)(?:\(([A-Da-d])\)|([A-Da-d])[\.\)]|([A-Da-d]):)\s+/g;
    let optM: RegExpExecArray | null;

    while ((optM = optRegex.exec(cleanBlock)) !== null) {
      const letter = (optM[1] || optM[2] || optM[3]).toUpperCase();
      optionMatches.push({
        letter,
        index: optM.index,
        text: "",
      });
    }

    let questionStem = cleanBlock;
    const options: string[] = [];

    if (optionMatches.length >= 2) {
      questionStem = cleanBlock.substring(0, optionMatches[0].index).trim();
      for (let i = 0; i < optionMatches.length; i++) {
        const start = optionMatches[i].index;
        const end = i < optionMatches.length - 1 ? optionMatches[i + 1].index : cleanBlock.length;
        const optChunk = cleanBlock.substring(start, end).trim();
        // Remove option prefix like "(A) " or "A. "
        const cleanedOption = optChunk.replace(/^(?:\([A-Da-d]\)|[A-Da-d][\.\)]|[A-Da-d]:)\s*/i, "").trim();
        if (cleanedOption) {
          options.push(cleanedOption);
        }
      }
    } else {
      // Check if options are on separate lines
      const lines = cleanBlock.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length >= 3) {
        questionStem = lines[0];
        for (let i = 1; i < Math.min(lines.length, 5); i++) {
          options.push(lines[i].replace(/^[A-Da-d1-4][\.\)]\s*/, ""));
        }
      }
    }

    // Ensure at least 4 standard options if fewer were detected
    while (options.length < 4) {
      const missingIndex = options.length;
      options.push(`Option ${String.fromCharCode(65 + missingIndex)}`);
    }

    if (questionStem.length > 5) {
      questions.push({
        id: `gen-q-${idx + 1}-${Date.now()}`,
        question_text: questionStem.trim(),
        options: options.slice(0, 4),
        correct_option: Math.min(correctOption, 3),
        marks: 1,
        explanation: explanation || undefined,
      });
    }
  });

  return questions;
}
