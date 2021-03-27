import React, { useState, useCallback, useEffect, useContext } from 'react'
import { RenderConfigurationForm, RenderConfigurationFormOptions } from './context'
import clx from 'classnames'
import { FaEdit } from 'react-icons/fa'
import { FiMove } from 'react-icons/fi'
import { AiTwotoneDelete } from 'react-icons/ai'
import EnginxContext from './context'

export default (node: JSX.Element, options: RenderConfigurationFormOptions): ReturnType<RenderConfigurationForm> => {
  const context = useContext(EnginxContext)
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
  return (
    <div
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
