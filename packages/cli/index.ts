import webpack from 'webpack'
import genConfig from './webpack.config'

const compile = webpack(genConfig({}))

compile.run((err) => {
  console.log(err)
})
