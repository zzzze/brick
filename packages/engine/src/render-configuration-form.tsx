import React, { useState, useCallback, useEffect, useContext, useRef } from 'react'
import { RenderConfigurationForm, RenderConfigurationFormOptions } from './context'
import clx from 'classnames'
import { FaEdit } from 'react-icons/fa'
import { FiMove } from 'react-icons/fi'
import { AiTwotoneDelete } from 'react-icons/ai'
import EnginxContext from './context'

export default (node: JSX.Element, options: RenderConfigurationFormOptions): ReturnType<RenderConfigurationForm> => {
  const context = useContext(EnginxContext)
  const [style, setStyle] = useState<React.CSSProperties>({top: -1, right: -1})
  const [configFormVisible, setConfigFormVisible] = useState(false)
  const handleShowConfigForm = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    options.ee.emit('close-config-form')
    setConfigFormVisible(true)
  }, [])
  const hideConfigForm = useCallback(() => setConfigFormVisible(false), [])
  const handleHideConfigForm = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    context.transactionRollback()
    hideConfigForm()
    setConfigFormVisible(false)
  }, [])
  const handleCommit = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    context.transactionCommit()
  }, [])
  const handleRemove = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      options.removeItem()
    },
    [options.removeItem]
  )
  useEffect(() => {
    options.ee.on('close-config-form', hideConfigForm)
    return () => {
      options.ee.off('close-config-form', hideConfigForm)
    }
  }, [])
  const container = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const style = {right: -1, top: -1}
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
  return (
    <div
      ref={container}
      style={style}
      className={clx('brick__config-form', {
        'brick__config-form--active': configFormVisible,
      })}>
      {configFormVisible ? (
        <div className="brick__config-form-btn-g2">
          <button data-testid="close-btn" onClick={handleHideConfigForm}>
            close
          </button>
          {!context.autoCommit && (
            <button data-testid="commit-btn" onClick={handleCommit}>
              commit
            </button>
          )}
        </div>
      ) : (
        <div className="brick__config-form-btn-g1">
          <span
            className="brick__config-form-remove-btn"
            title="remove"
            data-testid="remove-btn"
            onClick={handleRemove}>
            <AiTwotoneDelete />
          </span>
          <span
            className="brick__config-form-edit-btn"
            title="edit"
            data-testid="edit-btn"
            onClick={handleShowConfigForm}>
            <FaEdit />
          </span>
          <span className="brick__config-form-move-btn" title="move" ref={options.connectDragSource}>
            <FiMove />
          </span>
        </div>
      )}
      {configFormVisible && node}
    </div>
  )
}
