import 'jest-enzyme'
import React from 'react'
import { Engine } from '../src/engine'
import { StringType, NumberType, BooleanType, ObjectType, CodeType } from '../src/data/data-type'
import { ObjectStringInput } from '@brick/components'

Engine.registerDataType(StringType)
Engine.registerDataType(NumberType)
Engine.registerDataType(BooleanType)
Engine.registerDataType(ObjectType)
Engine.registerDataType(CodeType)

Engine.registerFormItem('object', () => <ObjectStringInput className="formitem-textarea" />)
