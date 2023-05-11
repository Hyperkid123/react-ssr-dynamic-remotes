const base = require('./webpack.config')
const path = require('path')

const config = base(true)
config.entry = path.resolve(__dirname, './server/server.tsx')
config.output.path = path.resolve(__dirname, 'build/server')


// required with the false target
console.log({wdr: __dirname})



module.exports = config