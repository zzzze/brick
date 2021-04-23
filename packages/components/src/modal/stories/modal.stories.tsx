import React, { useCallback, useEffect, useState } from 'react'
import { Story, Meta } from '@storybook/react'
import { Modal, ModalProps } from '../index'
import { JssProvider, ThemeProvider } from 'react-jss'
import { theme } from '@brick/shared'

export default {
  title: 'Components/Modal',
  component: Modal,
  argTypes: {},
} as Meta

const Template: Story<ModalProps> = ({ visible: _visible, ...props }) => {
  const [visible, setVisible] = useState(!!_visible)
  const handleClick = useCallback(() => setVisible(true), [])
  const handleClose = useCallback(() => setVisible(false), [])
  useEffect(() => setVisible(_visible), [_visible])
  return (
    <JssProvider>
      <ThemeProvider theme={theme.defaultTheme}>
        <div className="container">
          <button onClick={handleClick}>click</button>
          <Modal title="Hello World" visible={visible} {...props} onClose={handleClose}>
            <div>hello world</div>
          </Modal>
        </div>
      </ThemeProvider>
    </JssProvider>
  )
}

export const Default = Template.bind({})
Default.args = {
  transitionDuration: 300,
}
