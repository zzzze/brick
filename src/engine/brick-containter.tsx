import React from 'react'

export interface BrickContainerProps extends React.HTMLAttributes<HTMLElement> {
  tag?: keyof React.ReactHTML
  propsForm?: React.ReactElement
}

const BrickContainer: React.FC<BrickContainerProps> = ({ tag, children, propsForm, ...props }: BrickContainerProps) => {
  const Tag = tag || 'div'
  return (
    <Tag {...props}>
      {propsForm}
      {children}
    </Tag>
  )
}

export default BrickContainer
