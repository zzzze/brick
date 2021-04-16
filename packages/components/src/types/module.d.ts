// eslint-disable-next-line
/// <reference path="../../../../node_modules/monaco-editor/monaco.d.ts" />

declare namespace NodeJS {
  interface Global {
    __DEV__: boolean
    __BRICK_INSTANCE_TYPES__: string
  }
}

declare interface Window {
  __DEV__: boolean
  __BRICK_INSTANCE_TYPES__: string
}

declare module '*.md' {
  const Component: React.ReactElement
  export default Component
}
