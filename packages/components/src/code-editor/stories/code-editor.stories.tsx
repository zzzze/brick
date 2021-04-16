import React, { useCallback, useRef } from 'react'
import { Story, Meta } from '@storybook/react'
import { Editor, IEditorProps, Instance } from '../index'

export default {
  title: 'Components/Editor',
  component: Editor,
  argTypes: {},
} as Meta

const Template: Story<IEditorProps> = (args) => {
  const ref = useRef<Instance | null>(null)
  const handleSetValue = useCallback(() => {
    if (!ref.current) {
      return
    }
    ref.current.value = '() => {}'
  }, [])

  return (
    <div>
      <button onClick={handleSetValue}>click</button>
      <Editor ref={ref} {...args} />
    </div>
  )
}

export const Default = Template.bind({})
Default.args = {
  value: 'function x() {\n\tconsole.log("Hello world!");\n}',
  style: {
    width: '100%',
    height: 300,
  },
}
