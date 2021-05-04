import React, { useCallback, useRef } from 'react'
import { Story, Meta } from '@storybook/react'
import itemConfig from './item-root.config.json'
import githubStylePageConfig from './github-style-page.config.json'
import { Engine, EngineProps } from '../src/engine'
import registerBricks from './register-bricks'
import '@brick/components/lib/tooltip.css'
import './style.css'
import '../index.css'
import { Blueprint } from '../src/types'
import { Rule, StyleSheet } from 'jss'

export default {
  title: 'Example/Engine',
  component: Engine,
  argTypes: {},
} as Meta

const generateID = (rule: Rule, sheet?: StyleSheet) => {
  return `${sheet?.options.classNamePrefix ?? ''}${rule.key}`
}

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
    <div key={JSON.stringify(args.blueprint)}>
      <button onClick={handleUndo}>undo</button>
      <button onClick={handleRedo}>redo</button>
      <Engine generateJssID={generateID} ref={ref} {...args} />
    </div>
  )
}

export const Default = Template.bind({})
Default.args = {
  blueprint: {
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
  blueprint: itemConfig as Blueprint,
}

export const WebPage = Template.bind({})
WebPage.args = {
  blueprint: githubStylePageConfig as Blueprint,
}
