import React, { useState, useCallback, useEffect } from 'react'
import { RenderConfigurationForm } from './context'
import clx from 'classnames'
import EventEmitter from 'eventemitter3'
import { ConnectDragSource } from 'react-dnd'
import { FaEdit } from 'react-icons/fa'
import { FiMove } from 'react-icons/fi'
import { AiTwotoneDelete } from 'react-icons/ai'

export default (
  node: JSX.Element,
  ee: EventEmitter,
  connectDragSource: ConnectDragSource,
  removeItem: () => void
): ReturnType<RenderConfigurationForm> => {
  const [configFormVisible, setConfigFormVisible] = useState(false)
  const handleShowConfigForm = useCallback(() => {
    ee.emit('close-config-form')
    setConfigFormVisible(true)
  }, [])
  const handleHideConfigForm = useCallback(() => {
    setConfigFormVisible(false)
  }, [])
  useEffect(() => {
    ee.on('close-config-form', handleHideConfigForm)
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
        </div>
      ) : (
        <div className="brick__config-form-btn-g1">
          <span className="brick__config-form-remove-btn" title="remove" data-testid="remove-btn" onClick={removeItem}>
            <AiTwotoneDelete />
          </span>
          <span
            className="brick__config-form-edit-btn"
            title="edit"
            data-testid="edit-btn"
            onClick={handleShowConfigForm}>
            <FaEdit />
          </span>
          <span className="brick__config-form-move-btn" title="move" ref={connectDragSource}>
            <FiMove />
          </span>
        </div>
      )}
      {configFormVisible && node}
    </div>
  )
}
