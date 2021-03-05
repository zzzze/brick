import React from 'react'

export interface BrickContainerProps extends React.HTMLAttributes<HTMLElement> {
  tag?: keyof React.ReactHTML | React.ComponentType
  configurationForm?: React.ReactElement | null
}

const BrickContainer = React.forwardRef<unknown, BrickContainerProps>(
  ({ tag, children, configurationForm: configForm, ...props }, ref) => {
    const Tag = tag || 'div'
    ;(props as any).ref = ref // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    return (
      <Tag {...props}>
        {configForm}
        {children}
      </Tag>
    )
  }
)

export { BrickContainer }
