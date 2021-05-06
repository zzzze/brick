export default function evalForExpr(
  expression: string,
  $this: Record<string, unknown>,
  item: unknown,
  index: number
): unknown {
  expression = expression.replace(/^\{\{|\}\}$/g, '')
  return new Function('$this', 'item', 'index', 'return ' + expression)($this, item, index) // eslint-disable-line
}
