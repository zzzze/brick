import 'jest-enzyme'
import { Engine } from '@/index'
import { StringType, NumberType, BooleanType } from '../src/data/data-type'

Engine.registerDataType(StringType)
Engine.registerDataType(NumberType)
Engine.registerDataType(BooleanType)
