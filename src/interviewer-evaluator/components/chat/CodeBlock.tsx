"use client";

import { useState, useCallback } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
}

// Basic syntax highlighting for JavaScript/TypeScript
function highlightCode(code: string, language: string): React.ReactNode {
  if (!["javascript", "typescript", "js", "ts", "jsx", "tsx"].includes(language.toLowerCase())) {
    return code;
  }

  const keywords = /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|default|async|await|try|catch|throw|new|this|typeof|instanceof)\b/g;
  const strings = /(["'`])(?:(?!\1|\\).|\\.)*\1/g;
  const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;
  const functions = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g;
  const numbers = /\b(\d+\.?\d*)\b/g;

  // Split code into tokens for highlighting
  const lines = code.split("\n");

  return lines.map((line, lineIndex) => {
    // Process each line
    let result: React.ReactNode[] = [];
    let lastIndex = 0;
    let key = 0;

    // Simple tokenizer
    const tokens: { type: string; value: string; index: number }[] = [];

    // Find comments first
    let match;
    const commentRegex = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;
    while ((match = commentRegex.exec(line)) !== null) {
      tokens.push({ type: "comment", value: match[0], index: match.index });
    }

    // Find strings
    const stringRegex = /(["'`])(?:(?!\1|\\).|\\.)*\1/g;
    while ((match = stringRegex.exec(line)) !== null) {
      tokens.push({ type: "string", value: match[0], index: match.index });
    }

    // Find keywords
    const keywordRegex = /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|default|async|await|try|catch|throw|new|this|typeof|instanceof)\b/g;
    while ((match = keywordRegex.exec(line)) !== null) {
      tokens.push({ type: "keyword", value: match[0], index: match.index });
    }

    // Find function names
    const funcRegex = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g;
    while ((match = funcRegex.exec(line)) !== null) {
      tokens.push({ type: "function", value: match[1], index: match.index });
    }

    // Sort tokens by index and filter overlapping
    tokens.sort((a, b) => a.index - b.index);

    const usedRanges: { start: number; end: number }[] = [];
    const filteredTokens = tokens.filter((token) => {
      const start = token.index;
      const end = token.index + token.value.length;
      for (const range of usedRanges) {
        if (start < range.end && end > range.start) {
          return false;
        }
      }
      usedRanges.push({ start, end });
      return true;
    });

    // Build highlighted line
    for (const token of filteredTokens) {
      if (token.index > lastIndex) {
        result.push(
          <span key={key++}>{line.substring(lastIndex, token.index)}</span>
        );
      }

      const color =
        token.type === "comment"
          ? "#6A9955"
          : token.type === "string"
          ? "#CE9178"
          : token.type === "keyword"
          ? "#569CD6"
          : token.type === "function"
          ? "#DCDCAA"
          : "#D4D4D4";

      result.push(
        <span key={key++} style={{ color }}>
          {token.value}
        </span>
      );

      lastIndex = token.index + token.value.length;
    }

    if (lastIndex < line.length) {
      result.push(<span key={key++}>{line.substring(lastIndex)}</span>);
    }

    if (result.length === 0) {
      result.push(<span key={key++}>{line || " "}</span>);
    }

    return (
      <div key={lineIndex}>
        {result}
        {lineIndex < lines.length - 1 ? "\n" : ""}
      </div>
    );
  });
}

export function CodeBlock({
  code,
  language = "javascript",
}: CodeBlockProps): React.ReactNode {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  }, [code]);

  const displayLanguage = language.toLowerCase().replace(/^(js|ts)$/, (m) =>
    m === "js" ? "javascript" : "typescript"
  );

  return (
    <div
      className="my-3 overflow-hidden"
      style={{
        borderRadius: "var(--radius-md)",
        background: "#1E1E1E",
      }}
      aria-label={`Code example in ${displayLanguage}`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{
          background: "#2D2D2D",
          padding: "var(--spacing-2) var(--spacing-3)",
        }}
      >
        <span
          style={{
            fontSize: "var(--font-size-xs)",
            color: "#9CA3AF",
          }}
        >
          {displayLanguage}
        </span>
        <button
          onClick={copyToClipboard}
          className="transition-colors"
          style={{
            background: "transparent",
            border: "none",
            fontSize: "var(--font-size-xs)",
            color: copied ? "var(--teal-1)" : "#9CA3AF",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            if (!copied) {
              e.currentTarget.style.color = "var(--teal-1)";
            }
          }}
          onMouseLeave={(e) => {
            if (!copied) {
              e.currentTarget.style.color = "#9CA3AF";
            }
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = "2px solid var(--teal-1)";
            e.currentTarget.style.outlineOffset = "2px";
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = "none";
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Code */}
      <pre
        className="overflow-x-auto"
        style={{
          margin: 0,
          padding: "var(--spacing-3)",
          fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
          fontSize: "var(--font-size-sm)",
          lineHeight: "1.5",
          color: "#D4D4D4",
        }}
      >
        <code>{highlightCode(code.trim(), language)}</code>
      </pre>
    </div>
  );
}
