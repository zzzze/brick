import React, { forwardRef, RefObject, useCallback, useContext, useMemo } from 'react'
import { createUseStyles, useTheme } from 'react-jss'
import EnginxContext from './context'
import { theme as _theme } from '@brick/shared'
import { Modal } from '@brick/components'

const useStyles = createUseStyles(
  {
    content: {
      maxHeight: '80vh',
      overflowY: 'auto',
    },
  },
  { name: 'ConfigurationPanel' }
)

const ConfigurationPanel = forwardRef<HTMLElement>((_, ref) => {
  const theme: _theme.Theme = useTheme()
  const duration = theme.transitions.duration.short
  const classes = useStyles()
  const context = useContext(EnginxContext)
  const visible = useMemo(() => context.selectedInstance !== null, [context.selectedInstance])
  const handleHideConfigPanel = useCallback(() => {
    context.transactionRollback()
    context.selectInstance(null)
  }, [])
  const closeBtnProps = useMemo(() => {
    if (context.selectedInstance == null) {
      return {
        testID: 'close-btn',
      }
    }
    return {
      testID: `${context.selectedInstance}-close-btn`,
    }
  }, [context.selectedInstance])
  return (
    <Modal
      transitionDuration={duration}
      visible={visible}
      onClose={handleHideConfigPanel}
      closeBtnProps={closeBtnProps}>
      <div className={classes.content} ref={ref as RefObject<HTMLDivElement>} />
    </Modal>
  )
})

export default ConfigurationPanel
