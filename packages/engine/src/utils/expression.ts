import escapeRegExp from './escape-regexp'

export function captureExpression(obj: unknown, delimiters: [string, string]): RegExpMatchArray | null {
  if (typeof obj !== 'string') {
    return null
  }
  delimiters = delimiters.map((delimiter) => escapeRegExp(delimiter)) as [string, string]
  const [pre, post] = delimiters
  const characterInExpr = `.`
  const pattern = new RegExp(`${pre}${characterInExpr}(?:(?<!${pre})${characterInExpr})*?${post}`, 'g')
  return obj.match(pattern) // eslint-disable-line @typescript-eslint/prefer-regexp-exec
}

export function trimExpression(expression: string, delimiters: [string, string]): string {
  delimiters = delimiters.map((delimiter) => escapeRegExp(delimiter)) as [string, string]
  const [pre, post] = delimiters
  const pattern = new RegExp(`^${pre}\\s*|\\s*${post}$`, 'g')
  return expression.replace(pattern, '')
}

export function isExpression(obj: unknown, delimiters: [string, string]): obj is string {
  if (typeof obj !== 'string') {
    return false
  }
  delimiters = delimiters.map((delimiter) => escapeRegExp(delimiter)) as [string, string]
  const [pre, post] = delimiters
  const characterInExpr = `.`
  const pattern = new RegExp(
    `^${pre}${characterInExpr}(?:(?<!${pre})${characterInExpr}(?!${post}))*${characterInExpr}?${post}$`
  )
  return pattern.test(obj)
}

export function captureAttrDependencies(obj: unknown, thisIdendifier: string): string[] | null {
  if (typeof obj !== 'string') {
    return null
  }
  thisIdendifier = escapeRegExp(thisIdendifier)
  const pattern = new RegExp(`${thisIdendifier}\\.(\\w+)`, 'g')
  const result: string[] = []
  let match = pattern.exec(obj)
  while (match) {
    result.push(match[1])
    match = pattern.exec(obj)
  }
  return result.length ? result : null
}

export function isForParamsExpression(obj: unknown, delimiters: [string, string], forParams: string[]): obj is string {
  if (typeof obj !== 'string') {
    return false
  }
  delimiters = delimiters.map((delimiter) => escapeRegExp(delimiter)) as [string, string]
  const [pre, post] = delimiters
  forParams = forParams.map((param) => escapeRegExp(param))
  const pattern = new RegExp(`^${pre}\\s*(${forParams.join('|')})\\s*${post}`)
  return pattern.test(obj)
}
