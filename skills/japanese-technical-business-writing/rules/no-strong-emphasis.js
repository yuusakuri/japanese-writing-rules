export default function noStrongEmphasis(context) {
  const { Syntax, RuleError, report } = context;

  return {
    [Syntax.Strong](node) {
      report(
        node,
        new RuleError(
          "本文では太字による強調を使用しないでください。重要性や優先度は、文章の構造と内容で明示してください。"
        )
      );
    }
  };
}
