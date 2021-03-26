import 'jest-enzyme'
import { Engine } from '@/index'
import { StringType, NumberType, BooleanType, ObjectType, CodeType } from '../src/data/data-type'

Engine.registerDataType(StringType)
Engine.registerDataType(NumberType)
Engine.registerDataType(BooleanType)
Engine.registerDataType(ObjectType)
Engine.registerDataType(CodeType)
