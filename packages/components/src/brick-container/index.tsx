import React from 'react'

export interface BrickContainerProps extends React.HTMLAttributes<HTMLElement> {
  tag?: keyof React.ReactHTML
  configForm?: React.ReactElement | null
}

const BrickContainer: React.FC<BrickContainerProps> = ({
  tag,
  children,
  configForm,
  ...props
}: BrickContainerProps) => {
  const Tag = tag || 'div'
  return (
    <Tag {...props}>
      {configForm}
      {children}
    </Tag>
  )
}

export { BrickContainer }
