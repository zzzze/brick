import React, { ReactElement, RefObject, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import ConfigurationFormContext from './configuration-form-context'
import cloneDeep from 'lodash/cloneDeep'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import { Tooltip } from '../tooltip/index'
import { FaEdit } from 'react-icons/fa'
import { AiFillCheckCircle, AiFillCloseCircle } from 'react-icons/ai'
import set from 'lodash/set'
import get from 'lodash/get'
import clx from 'classnames'

interface EventData {
  target: {
    name: string
    value: Record<string, string>
  }
}

interface FormItemCommonProps {
  name: string
  label: string
  value?: unknown
  'data-testid'?: string
  ref?: RefObject<{ value: unknown }>
  tips?: ReactElement | string
  onChange?: (data: EventData) => void
  getPopupContainer?: () => HTMLElement
}

interface FormItemProps extends FormItemCommonProps {
  children: React.ReactElement<FormItemCommonProps>
}

const FormItem: React.FC<FormItemProps> = ({ label, name, children, ...props }: FormItemProps) => {
  const child = React.Children.only(children)
  const context = useContext(ConfigurationFormContext)
  const [isEditMode, setIsEditMode] = useState(false)
  const onChange = useCallback(
    (event: EventData) => {
      let newData = cloneDeep(context.data)
      newData = set(newData, event.target.name, event.target.value)
      context.onChange(newData)
    },
    [context.data]
  )
  const ref = useRef<{ value: unknown }>(null)
  useEffect(() => {
    if (context.autoCommit || !ref.current) {
      return
    }
    ref.current.value = get(context.data, name) || null
  }, [context.data, name, isEditMode, ref])
  const value = useMemo(() => get(context.data, name), [context.data, name])
  const enterEditMode = useCallback(() => {
    setIsEditMode(true)
  }, [])
  const exitEditMode = useCallback(() => {
    setIsEditMode(false)
  }, [])
  const handleCommit = useCallback(() => {
    context.commit()
    exitEditMode()
  }, [])
  return (
    <div
      className={clx('config-form__item', {
        'config-form__item--edit': isEditMode,
      })}>
      <label className="config-form__label" htmlFor="id">
        {label}
        {props.tips && (
          <Tooltip getContainer={props.getPopupContainer} content={props.tips}>
            <span style={{ verticalAlign: 'middle', marginLeft: 5 }}>
              <AiOutlineQuestionCircle className="config-form__item-btn" />
            </span>
          </Tooltip>
        )}
      </label>
      {!isEditMode && (
        <div className="config-form__value">
          {typeof value === 'object' ? JSON.stringify(value) : String(value || '')}
        </div>
      )}
      {isEditMode &&
        context.autoCommit &&
        React.cloneElement(child, {
          name,
          value: value || '',
          onChange,
          ...props,
        })}
      {isEditMode &&
        !context.autoCommit &&
        React.cloneElement(child, {
          name,
          ref,
          onChange,
          ...props,
        })}
      <div className="config-form__item-btg">
        {!isEditMode && <FaEdit title="edit" onClick={enterEditMode} />}
        {isEditMode && (
          <>
            <AiFillCheckCircle title="confirm" className="config-form__item-btn" onClick={handleCommit} />
            <AiFillCloseCircle title="cancel" className="config-form__item-btn" onClick={exitEditMode} />
          </>
        )}
      </div>
    </div>
  )
}

export { ConfigurationFormContext }
export { FormItem as ConfigurationFormItem }
