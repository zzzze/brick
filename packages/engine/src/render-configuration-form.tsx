import React, { useState, useCallback, useEffect, useContext, useRef, useMemo } from 'react'
import ReactDOM from 'react-dom'
import { RenderConfigurationForm, RenderConfigurationFormOptions } from './context'
import clx from 'classnames'
import { FaEdit } from 'react-icons/fa'
import { FiMove } from 'react-icons/fi'
import { AiTwotoneDelete } from 'react-icons/ai'
import EnginxContext from './context'
import { Transition } from 'react-transition-group'

export default (node: JSX.Element, options: RenderConfigurationFormOptions): ReturnType<RenderConfigurationForm> => {
  const context = useContext(EnginxContext)
  const [style, setStyle] = useState<React.CSSProperties>({ top: -1, right: -1 })
  const configFormVisible = useMemo(() => context.selectedInstance === options.blueprint._key, [
    context.selectedInstance,
    options.blueprint._key,
  ])
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
  const configurationPanelcontainer = context.getConfigurationPanelContainer()
  const getPopupContainer = useCallback(() => {
    return container.current
  }, [])
  const stopClickPropagation = useCallback((event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
  }, [])
  return (
    <div ref={container} style={style} onClick={stopClickPropagation} className={clx('brick__config-form')}>
      <div className="brick__config-form-btn-g1">
        <span
          className="brick__config-form-remove-btn"
          title="remove"
          data-testid={`${options.blueprint._key}-remove-btn`}
          onClick={handleRemove}>
          <AiTwotoneDelete />
        </span>
        <span
          className="brick__config-form-edit-btn"
          title="edit"
          data-testid={`${options.blueprint._key}-edit-btn`}
          onClick={handleShowConfigForm}>
          <FaEdit />
        </span>
        <span className="brick__config-form-move-btn" title="move" ref={options.connectDragSource}>
          <FiMove />
        </span>
      </div>
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
    </div>
  )
}
