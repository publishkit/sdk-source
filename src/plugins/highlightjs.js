const plugin = { id: 'highlightjs' }

plugin.deps = ["https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.7.0/build/highlight.min.js"]
plugin.css = (options) => [`https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.7.0/build/styles/${options.theme}.min.css`]


plugin.code = async (options, app) => {

    // themes - https://github.com/highlightjs/highlight.js/tree/main/src/styles
    // demo - https://highlightjs.org/static/demo/
    document.querySelectorAll('pre code').forEach((el) => { hljs.highlightElement(el) })
    
}

export default plugin