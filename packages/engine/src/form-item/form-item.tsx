import React, {
  ChangeEvent,
  CSSProperties,
  ReactElement,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import ConfigurationFormContext from './context'
import cloneDeep from 'lodash/cloneDeep'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import { InputType, Tooltip } from '@brick/components'
import { AiFillCheckCircle, AiFillCloseCircle } from 'react-icons/ai'
import { createUseStyles } from 'react-jss'
import { theme } from '@brick/shared'
import set from 'lodash/set'
import get from 'lodash/get'
import clx from 'classnames'
import { ExpressionInput } from '@brick/components'
import { typePredication } from '@brick/shared'

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
  style?: CSSProperties
  'data-testid'?: string
  ref?: RefObject<{ value: unknown }>
  tips?: ReactElement | string
  onChange?: (data: EventData) => void
  getOverlayContainer?: () => HTMLElement
  types?: InputType[] // for ObjectKeyValueInput only
}

interface FormItemProps extends FormItemCommonProps {
  children: React.ReactElement<FormItemCommonProps>
}

const useStyles = createUseStyles(
  (theme: theme.Theme) => {
    return {
      item: {
        display: 'flex',
        position: 'relative',
        borderBottom: `solid 1px ${theme.palette.grey[200]}`,
        borderTop: `solid 1px ${theme.palette.grey[200]}`,
        paddingBottom: theme.spacing.Sm,
        paddingTop: theme.spacing.Sm,
        marginTop: '-1px',
      },
      itemEditMode: {
        flexWrap: 'wrap',
      },
      itemValue: {
        flex: 1,
        lineHeight: 1.5,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        cursor: 'pointer',
        wordBreak: 'break-all',
        color: theme.palette.grey[400],
      },
      itemLabel: {
        minWidth: '120px',
        marginRight: theme.spacing.Md,
        fontWeight: theme.typography.fontWeightMedium,
        lineHeight: '24px',
        borderRight: `solid 1px ${theme.palette.grey[100]}`,
        '$itemEditMode &': {
          width: '100%',
          marginBottom: theme.spacing.Sm,
        },
      },
      itemBtnGroup: {
        display: 'flex',
        alignItems: 'center',
        position: 'absolute',
        right: 0,
      },
      itemBtn: {
        marginLeft: theme.spacing.Sm,
      },
      expressionCheckbox: {
        fontSize: theme.typography.fontSize,
      },
    }
  },
  { name: 'FormItem' }
)

const FormItem: React.FC<FormItemProps> = ({
  label,
  name,
  children,
  style,
  getOverlayContainer,
  tips,
  ...props
}: FormItemProps) => {
  const classes = useStyles()
  const child = React.Children.only(children)
  const context = useContext(ConfigurationFormContext)
  const [isEditMode, setIsEditMode] = useState(false)
  const [useExpr, setUseExpr] = useState(false)
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
  useEffect(() => {
    if (typePredication.isString(value) && /^\{\{.*\}\}$/.test(value)) {
      setUseExpr(true)
    }
  }, [value])
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
  const handleCheckboxChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setUseExpr(event.target.checked)
  }, [])
  const childProps = useMemo(() => {
    const props: Partial<FormItemCommonProps> = {
      name,
      ref,
      onChange,
      style: {
        ...child.props.style,
        ...style,
        display: isEditMode ? 'block' : 'none',
      },
    }
    if (typeof child.type !== 'string') {
      props.getOverlayContainer = getOverlayContainer
    }
    return props
  }, [child, getOverlayContainer, isEditMode])
  return (
    <div
      className={clx(classes.item, {
        [classes.itemEditMode]: isEditMode,
      })}>
      <label className={classes.itemLabel} htmlFor="id">
        {label}
        {tips && (
          <Tooltip getOverlayContainer={getOverlayContainer} content={tips}>
            <span style={{ verticalAlign: 'middle', marginLeft: 5 }}>
              <AiOutlineQuestionCircle />
            </span>
          </Tooltip>
        )}
      </label>
      {!isEditMode && (
        <div className={classes.itemValue} onClick={enterEditMode}>
          {typeof value === 'object' ? JSON.stringify(value) : String(value ?? '')}
        </div>
      )}
      {context.autoCommit &&
        React.cloneElement(child, {
          value: value ?? '',
          ...childProps,
          ...props,
        })}
      {!context.autoCommit &&
        !useExpr &&
        React.cloneElement(child, {
          ...childProps,
          ...props,
        })}
      {!context.autoCommit && useExpr && (
        // eslint-disable-next-line
        <ExpressionInput {...(childProps as any)} {...props} />
      )}
      {isEditMode && (
        <div className={classes.itemBtnGroup}>
          <input checked={useExpr} type="checkbox" id={`form-item-${label}`} onChange={handleCheckboxChange} />
          <label className={classes.expressionCheckbox} htmlFor={`form-item-${label}`}>
            Expression
          </label>
          <AiFillCheckCircle title="confirm" className={classes.itemBtn} onClick={handleCommit} />
          <AiFillCloseCircle title="cancel" className={classes.itemBtn} onClick={exitEditMode} />
        </div>
      )}
    </div>
  )
}

export default FormItem
