// eslint-disable-next-line
/// <reference path="../../../../node_modules/monaco-editor/monaco.d.ts" />

declare const __DEV__: boolean

declare namespace NodeJS {
  interface Global {
    __DEV__: boolean
  }
}

declare module '*.md' {
  const Component: React.ReactElement
  export default Component
}
