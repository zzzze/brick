import React, { ChangeEvent, CSSProperties, FC, MouseEvent, useCallback, useMemo, useState } from 'react'
import { AiOutlineExpand, AiOutlineMinusCircle, AiOutlineCompress } from 'react-icons/ai'
import { IOption, Select } from '../select'

interface ItemProps {
  value?: Record<string, string>
  index: number
  label: string
  expandKey: string | null
  setExpandKey: (key: string | null) => void
  handleChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleDeleteItem: (event: MouseEvent<HTMLElement>) => void
  getOverlayContainer?: () => HTMLElement
}

const valueInputWrapperStyle: CSSProperties = {
  position: 'relative',
  flex: 1,
  marginRight: 10,
}

const valueInputBtnStyle: CSSProperties = {
  position: 'absolute',
  right: 8,
  top: 6,
}

enum InputType {
  STRING = 'string',
  CODE = 'code',
  BOOLEAN = 'boolean',
}

const inputTypeOptions: IOption<InputType>[] = [
  {
    label: 'String',
    value: InputType.STRING,
  },
  {
    label: 'Code',
    value: InputType.CODE,
  },
  {
    label: 'Boolean',
    value: InputType.BOOLEAN,
  },
]

const Item: FC<ItemProps> = ({ value, index, label, handleChange, handleDeleteItem, ...props }: ItemProps) => {
  const itemValue = useMemo(() => value?.[label] || '', [value, label])
  const [inputType, setInputType] = useState(InputType.STRING)
  const enterExpand = useCallback(() => props.setExpandKey(label), [label])
  const exitExpand = useCallback(() => props.setExpandKey(null), [])
  const isExpand = useMemo(() => props.expandKey === label, [props.expandKey, label])
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', margin: '10px 0' }} key={index}>
      <input
        placeholder="key"
        className="formitem-input"
        style={{ width: 100, height: 16, lineHeight: '16px', flex: 'unset', marginRight: 10 }}
        name={`${index}-label`}
        type="text"
        value={label}
        onChange={handleChange}
      />
      <div style={{ ...valueInputWrapperStyle, visibility: isExpand ? 'hidden' : 'visible' }}>
        <input
          placeholder="value"
          className="formitem-input"
          style={{ paddingRight: 30, lineHeight: '16px', boxSizing: 'border-box', width: '100%' }}
          name={`${index}-value`}
          type="text"
          value={itemValue}
          onChange={handleChange}
        />
        <div style={valueInputBtnStyle} onClick={enterExpand} title="expand">
          <AiOutlineExpand />
        </div>
      </div>
      <Select<InputType>
        value={inputType}
        options={inputTypeOptions}
        onChange={setInputType}
        getOverlayContainer={props.getOverlayContainer}
      />
      <div
        style={{ paddingTop: 6, marginLeft: 10 }}
        data-testid={`remove-btn-${index}`}
        data-index={index}
        onClick={handleDeleteItem}
        title="remove item">
        <AiOutlineMinusCircle />
      </div>
      {isExpand && (
        <div style={{ width: '100%', position: 'relative', marginTop: 5 }}>
          <textarea
            className="formitem-textarea"
            style={{ width: '100%', height: 200, paddingBottom: 30, boxSizing: 'border-box' }}
            name={`${index}-value`}
            value={itemValue}
            onChange={handleChange}
          />
          <div title="reduce" style={{ textAlign: 'right', position: 'absolute', bottom: 10, right: 10 }}>
            <AiOutlineCompress className="config-form__item-btn" onClick={exitExpand} />
          </div>
        </div>
      )}
    </div>
  )
}

export default Item
