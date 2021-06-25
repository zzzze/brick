export const VALUE_PARAM_PATTERN = /^\{\{(.*)\}\}$/

export type MoveOnHover =
  | undefined
  | boolean
  | {
      vertical?: boolean
      horizontal?: boolean
    }
