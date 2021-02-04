import React from 'react'

interface ConfigFormWrapperProps {
  children: React.ReactElement<React.PropsWithChildren<unknown>>
}

const ConfigFormWrapper: React.FC<ConfigFormWrapperProps> = ({ children }: ConfigFormWrapperProps) => {
  return children
}

export default ConfigFormWrapper
