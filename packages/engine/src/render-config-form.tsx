import React, { useState, useCallback, useEffect } from 'react'
import { RenderConfigForm } from './context'
import clx from 'classnames'
import EventEmitter from 'eventemitter3'

export default (node: JSX.Element, ee: EventEmitter): ReturnType<RenderConfigForm> => {
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
        <button
          className="brick__config-form-btn brick__config-form-btn-close"
          data-testid="close-btn"
          onClick={handleHideConfigForm}>
          close
        </button>
      ) : (
        <button
          className="brick__config-form-btn brick__config-form-btn-edit"
          data-testid="edit-btn"
          onClick={handleShowConfigForm}>
          edit
        </button>
      )}
      {configFormVisible && node}
    </div>
  )
}
