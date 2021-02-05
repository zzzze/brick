import webpack from 'webpack'
import genConfig from './webpack.config'
import WebpackDevServer from 'webpack-dev-server'
import { Command } from 'commander'
import pkg from './package.json'

const runDevServe = () => {
  const compile = webpack(genConfig({}))
  const server = new WebpackDevServer(compile, {})
  server.listen(3000, 'localhost', (err) => {
    if (err) {
      console.log(err)
    }
    console.log('WebpackDevServer listening at localhost:', 3000)
  })
}

const runExport = () => {
  const compile = webpack(genConfig({}))
  compile.run((err) => {
    console.log(err)
  })
}

const program = new Command()
program.version(pkg.version)

program.command('dev').description('run dev').action(runDevServe)

program.command('export').description('export project').action(runExport)

program.parse(process.argv)
