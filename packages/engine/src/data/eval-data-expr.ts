export default function evalExpr(
  expression: string,
  $this: Record<string, unknown>,
  pSupply: Record<string, unknown>
): unknown {
  expression = expression.replace(/^\{\{|\}\}$/g, '')
  expression = expression.replace(/(\$?\w?[a-zA-Z]+\w?\.\w)/g, (match) =>
    !match.startsWith('$this.') ? `pSupply.${match}` : match
  )
  return new Function('$this', 'pSupply', 'return ' + expression)($this, pSupply) // eslint-disable-line
}
