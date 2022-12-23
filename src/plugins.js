import CorePlugins from './plugins/index'

const Plugins = window.Plugins = {}
const Core = CorePlugins.map(p => p.id)
const requiredPlugins = ['global','cssvars','hotkeys','modal']

Plugins.debug = true
Plugins.cache = {}
Plugins.options = {}
Plugins.active = []
Plugins.inactive = []
Plugins.failed = []

const debug = (...args) => Plugins.debug && console.log(args)


Plugins.register = (id, plugin = {}) => {
    if(!id || !plugin.id) throw new Error(`plugin is missing an id`)
    if(id != plugin.id) throw new Error(`registering plugin '${id}', but provided id '${plugin.id}'`)
    if(Plugins.cache[id]) throw new Error(`plugin id '${id}' already exist`)
    Plugins.cache[id] = plugin
}

Plugins.registerExternal = async (id, url, app) => {
    const script = await app.utils.getData(url)
    const fn = new Function(script) 
    const plugin = await fn()
    return Plugins.register(id, plugin)
}

Plugins.has = (key) => {
    return !!Plugins.cache[key]
}

Plugins.init = async (app) => {
    const { pkrc, frontmatter={} } = app.cache
    const plugins = pkrc.plugins
    const sorted = app.utils.array.unique([ ...Core, ...Object.keys(plugins) ])

    // https://www.stackfive.io/work/javascript/using-async-await-with-the-array-reduce-method
    // async reduce
    const load = await sorted.reduce(async (prev, key) => {
        const acc = await prev
        const isActive = requiredPlugins.includes(key) || ((plugins[key]+'').trim() == 'true')

        if(!isActive) return Plugins.inactive.push(key) && acc

        try {
            if(Core.includes(key)) Plugins.register(key, CorePlugins.find(p => p.id == key))
            else await Plugins.registerExternal(key, `/_publishkit/plugins/${key}.js`, app)
            
            const options = app.cfg(key) || {}
            const p = Plugins.cache[key]
            
            if(p.init) {
                const init = await p.init(options, app)
                if(!init) return Plugins.inactive.push(key) && acc
                if(typeof init == 'object') options._data = init
            }
            if(p.deps) acc.deps.push(typeof p.deps == 'function' ? p.deps(options, app) : p.deps)
            if(p.css) acc.css.push(typeof p.css == 'function' ? p.css(options, app) : p.css)
            if(p.ui) acc.ui.push([p.ui, options])
            
            // cache options
            Plugins.options[key] = options
            Plugins.active.push(key)
            
            return acc
        }catch(e){
            debug(`plugin:err:${key}`, e.message)
            Plugins.failed.push([key, e.message])
            return acc
        }
        
    }, Promise.resolve({ init: [], deps: [], css: [], ui: [] }))

    // append css
    app.utils.array.clean(load.css).map(css => document.querySelector("head").append(app.utils.cssEl(css)))
    // append deps
    await app.utils.loadScript(app.utils.array.clean(load.deps))
    // apply ui
    // for now running in parallel is acceptable because few plugins
    // but because we push to ui arrays, ui will behave at random if not applied in sequence
    await Promise.all(load.ui.map(([fn, options]) => fn(options, app)))

    return load
}


Plugins.get = (key) => {
    if(key) return Plugins.cache[key]
    else return Plugins.active.map(k => Plugins.cache[k]).filter(Boolean)
}


Plugins.run = async (app) => {
    const plugins = Plugins.get()
    const codes = plugins.map(p => {
        const options = Plugins.options[p.id]
        // debug(`plugin:${p.id}`, options)
        p.code && p.code(options, app)
    }).filter(Boolean)

    return Promise.all(codes)
}


export default Plugins