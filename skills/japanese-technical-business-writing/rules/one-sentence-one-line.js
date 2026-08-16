import { SentenceSplitterSyntax, splitAST } from "sentence-splitter";

const multilineSentenceMessage =
  "一文の途中で改行しないでください。一文を同じ行で完結させてから、コード、引用、表、箇条書きなどを配置してください。";
const multipleSentencesMessage =
  "一行に複数の文を記載しないでください。文ごとに改行し、一行を一文にしてください。";

export default function oneSentenceOneLine(context) {
  const { Syntax, RuleError, report, locator } = context;

  function reportRange(paragraph, range, message) {
    const start = range[0] - paragraph.range[0];
    const end = range[1] - paragraph.range[0];

    report(
      paragraph,
      new RuleError(message, {
        padding: locator.range([start, end])
      })
    );
  }

  return {
    [Syntax.Paragraph](node) {
      const sentenceRoot = splitAST(node);
      const sentences = sentenceRoot.children.filter(
        (child) => child.type === SentenceSplitterSyntax.Sentence
      );
      const firstSentenceByLine = new Map();
      const reportedDuplicateLines = new Set();

      for (const sentence of sentences) {
        if (sentence.loc.start.line !== sentence.loc.end.line) {
          reportRange(node, sentence.range, multilineSentenceMessage);
        }

        const line = sentence.loc.start.line;

        if (!firstSentenceByLine.has(line)) {
          firstSentenceByLine.set(line, sentence);
          continue;
        }

        if (reportedDuplicateLines.has(line)) {
          continue;
        }

        reportRange(node, sentence.range, multipleSentencesMessage);
        reportedDuplicateLines.add(line);
      }
    }
  };
}
