import React, { useState, useCallback, useEffect, useContext, useRef, useMemo } from 'react'
import ReactDOM from 'react-dom'
import { RenderConfigurationForm, RenderConfigurationFormOptions } from './context'
import { FaEdit } from 'react-icons/fa'
import { FiMove } from 'react-icons/fi'
import { AiTwotoneDelete } from 'react-icons/ai'
import EnginxContext from './context'
import { createUseStyles } from 'react-jss'
import { theme } from '@brick/shared'
import clx from 'classnames'
import { Transition } from 'react-transition-group'

const useStyles = createUseStyles(
  (theme: theme.Theme) => {
    return {
      btnGroup: {
        '& > *': {
          margin: `0 ${theme.spacing.Xss}px`,
        },
      },
      deleteBtn: {
        cursor: 'pointer',
      },
      editBtn: {
        cursor: 'pointer',
      },
      moveBtn: {
        cursor: 'move',
      },
    }
  },
  { name: 'RenderConfigurationForm' }
)

export default (node: JSX.Element, options: RenderConfigurationFormOptions): ReturnType<RenderConfigurationForm> => {
  const classes = useStyles()
  const context = useContext(EnginxContext)
  const [style, setStyle] = useState<React.CSSProperties>({ top: -1, right: -1 })
  const configFormVisible = useMemo(() => {
    if (context.selectedInstance !== options.blueprint._key) {
      return false
    }
    if (options.blueprint.copy && options.blueprint.copyID !== 0) {
      return false
    }
    return true
  }, [context.selectedInstance, options.blueprint._key, options.blueprint.copy, options.blueprint.copyID])
  const handleShowConfigForm = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      context.selectInstance(options.blueprint._key)
    },
    [options.blueprint._key]
  )
  const handleRemove = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      options.removeItem()
    },
    [options.removeItem]
  )
  const container = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const style = { right: -1, top: -1 }
    if (!configFormVisible || !container.current) {
      setStyle(style)
      return
    }
    const rect = container.current.getBoundingClientRect()
    const leftOverflow = rect.x
    if (leftOverflow < 0) {
      style.right = leftOverflow
    }
    const bottomOverflow = window.innerHeight - rect.bottom
    if (bottomOverflow < 0) {
      style.top = bottomOverflow
    }
    setStyle(style)
  }, [configFormVisible])
  const configurationPanelcontainer = context.configurationPanelRef?.current
  const getPopupContainer = useCallback(() => {
    return context.configurationPanelRef?.current
  }, [context.configurationPanelRef?.current])
  const stopClickPropagation = useCallback((event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
  }, [])
  return (
    <div ref={container} style={style} onClick={stopClickPropagation} className={options.classes.container}>
      <div className={clx(options.classes.btnGroup, classes.btnGroup)}>
        <span
          className={classes.deleteBtn}
          title="remove"
          data-testid={`${options.blueprint._key}-remove-btn`}
          onClick={handleRemove}>
          <AiTwotoneDelete />
        </span>
        <span
          className={classes.editBtn}
          title="edit"
          data-testid={`${options.blueprint._key}-edit-btn`}
          onClick={handleShowConfigForm}>
          <FaEdit />
        </span>
        <span className={classes.moveBtn} title="move" ref={options.connectDragSource}>
          <FiMove />
        </span>
      </div>
      {!context.configurationPanelContentUseTransition &&
        configFormVisible &&
        configurationPanelcontainer &&
        ReactDOM.createPortal(
          React.cloneElement(React.Children.only(node), {
            getPopupContainer,
          }),
          configurationPanelcontainer
        )}
      {context.configurationPanelContentUseTransition && (
        <Transition in={configFormVisible} timeout={300} unmountOnExit>
          {() =>
            configurationPanelcontainer &&
            ReactDOM.createPortal(
              React.cloneElement(React.Children.only(node), {
                getPopupContainer,
              }),
              configurationPanelcontainer
            )
          }
        </Transition>
      )}
    </div>
  )
}
