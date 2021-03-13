import React, { useState, useCallback, useEffect, useContext } from 'react'
import { RenderConfigurationForm, RenderConfigurationFormOptions } from './context'
import clx from 'classnames'
import { FaEdit } from 'react-icons/fa'
import { FiMove } from 'react-icons/fi'
import { AiTwotoneDelete } from 'react-icons/ai'
import Context from './context'

export default (node: JSX.Element, options: RenderConfigurationFormOptions): ReturnType<RenderConfigurationForm> => {
  const context = useContext(Context)
  const [configFormVisible, setConfigFormVisible] = useState(false)
  const handleShowConfigForm = useCallback(() => {
    options.ee.emit('close-config-form')
    setConfigFormVisible(true)
  }, [])
  const handleHideConfigForm = useCallback(() => {
    setConfigFormVisible(false)
  }, [])
  const handleCommit = useCallback(() => {
    context.transactionCommit()
  }, [])
  useEffect(() => {
    options.ee.on('close-config-form', handleHideConfigForm)
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
            onClick={options.removeItem}>
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
