import { CSSProperties } from 'react'
import { EventData } from '@brick/shared/types/form'

export interface ObjectInputProps {
  name?: string
  value?: Record<string, string>
  onChange?: (data: EventData<unknown>) => void
  className?: string
  style?: CSSProperties
  getOverlayContainer?: () => HTMLElement
}
