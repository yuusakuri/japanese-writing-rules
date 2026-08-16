export default function oneSentenceOneLine(context) {
  const { Syntax, RuleError, report, getSource } = context;

  return {
    [Syntax.Paragraph](node) {
      const text = getSource(node);
      const lines = text.split(/\r?\n/);
      const hasIncompleteLineBreak = lines.slice(0, -1).some((line) => {
        const trimmed = line.trimEnd();

        if (trimmed.length === 0) {
          return false;
        }

        const withoutClosingMarks = trimmed.replace(
          /[」』）】〕］〉》”’"'*_`~)\]]+$/u,
          ""
        );
        return !/[。！？!?]$/u.test(withoutClosingMarks);
      });

      if (!hasIncompleteLineBreak) {
        return;
      }

      report(
        node,
        new RuleError(
          "一文の途中で改行しないでください。一文を同じ行で完結させてから、コード、引用、表、箇条書きなどを配置してください。"
        )
      );
    }
  };
}
