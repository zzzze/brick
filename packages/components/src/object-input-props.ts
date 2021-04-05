import {CSSProperties} from "react"

export interface ObjectInputEventData {
  target: {
    name: string
    value: Record<string, string>
  }
}

export interface ObjectInputProps {
  name?: string
  value?: Record<string, string>
  onChange?: (data: ObjectInputEventData) => void
  className?: string
  style?: CSSProperties
}
