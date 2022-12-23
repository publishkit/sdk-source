import * as dotenv from 'dotenv-flow'
dotenv.config()
// import * as path from 'path'
// import * as url from 'url'
// const __filename = url.fileURLToPath(import.meta.url)
// const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
import css from 'rollup-plugin-import-css'
import obfuscator from 'rollup-plugin-obfuscator'
import cleanup from 'rollup-plugin-cleanup'
import replace from 'rollup-plugin-replace'
import pkg from './package.json' assert { type: "json" }

const { NODE_ENV='dev' } = process.env
const { version, author } = pkg
const rollup = []
const dist = '../pk-sdk'


if(NODE_ENV == 'prod') {
    rollup.push({
        input: 'src/index.js',
        output: { file: `dist/pk.js`, format: 'iife' },
        plugins: [
            replace({ 
                'process.env.PK_URL': JSON.stringify(process.env.PK_URL), 
                'process.env.PK_API': JSON.stringify(process.env.PK_API) 
            }),
            cleanup(),
            css({ output: 'pk.css', minify: true }),
            obfuscator.default()
        ]
    })

    // SDK
    rollup.push({
        input: 'src/sdk.js',
        output: { file: `dist/sdk.js`, format: 'iife' },
        plugins: [
            replace({ 
                'process.env.PK_URL': JSON.stringify(process.env.PK_URL), 
                'process.env.PK_API': JSON.stringify(process.env.PK_API) 
            }),
            cleanup(),
            obfuscator.default()
        ]
    })
}

if(NODE_ENV == 'dev'){
    rollup.push({
        input: 'src/index.js',
        output: { file: `dev/pk.js`, format: 'iife' },
        plugins: [
            replace({ 
                'process.env.PK_URL': JSON.stringify(process.env.PK_URL), 
                'process.env.PK_API': JSON.stringify(process.env.PK_API) 
            }),
            cleanup(),
            css({ output: 'pk.css', minify: false }),
        ]
    })

    // SDK
    rollup.push({
        input: 'src/sdk.js',
        output: { file: `dev/sdk.js`, format: 'iife' },
        plugins: [
            replace({ 
                'process.env.PK_URL': JSON.stringify(process.env.PK_URL), 
                'process.env.PK_API': JSON.stringify(process.env.PK_API) 
            }),
            cleanup()
        ]
    })
}
    






export default rollup