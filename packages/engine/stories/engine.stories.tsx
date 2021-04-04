import React, { useCallback, useRef } from 'react'
import { Story, Meta } from '@storybook/react'
import itemConfig from './item-root.config.json'
import githubStylePageConfig from './github-style-page.config.json'
import { Engine, EngineProps } from '../src'
import { Config } from '../src/types'
import registerBricks from './register-bricks'
import '@brick/components/lib/tooltip.css'
import './style.css'
import '../index.css'

export default {
  title: 'Example/Engine',
  component: Engine,
  argTypes: {},
} as Meta

const Template: Story<EngineProps> = (args) => {
  registerBricks()
  const ref = useRef<Engine>(null)
  const handleUndo = useCallback(() => {
    ref.current?.undo()
  }, [])
  const handleRedo = useCallback(() => {
    ref.current?.redo()
  }, [])
  return (
    <div>
      <button onClick={handleUndo}>undo</button>
      <button onClick={handleRedo}>redo</button>
      <Engine ref={ref} {...args} />
    </div>
  )
}

export const Default = Template.bind({})
Default.args = {
  config: {
    name: 'Text',
    _key: '001',
    data: {
      content: 'hello world',
    },
    version: '0.0.1',
  },
}

export const WithHandler = Template.bind({})
WithHandler.args = {
  config: itemConfig as Config,
}

export const GithubStylePage = Template.bind({})
GithubStylePage.args = {
  config: githubStylePageConfig as Config,
}
