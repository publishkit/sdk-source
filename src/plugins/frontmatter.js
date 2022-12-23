const plugin = { id: 'frontmatter' }
// const helpers = plugin.helpers = {}

plugin.deps = ["https://cdn.jsdelivr.net/npm/yamljs@0.3.0/dist/yaml.min.js"]

plugin.ui = async (options, app) => {
    // const string = `<pre><code>${JSON.stringify(app.cache.frontmatter, null, 2)}</code></pre>`
    const string = `<pre><code>${YAML.stringify(app.cache.frontmatter, 2)}</code></pre>`
    const string2 = `<pre><code>${YAML.stringify(app.cache.config, 2)}</code></pre>`

    app.ui.set('frontmatter', string)
    app.ui.push('center', app.ui.get('frontmatter'))
    app.ui.push('center', string2)
}


export default plugin