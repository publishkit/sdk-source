
const app = {
    cache: {},
    theme: {},
}

app.theme.get = () => (app.utils.ls('theme.mode') || app.utils.isDark() || 'light')

app.theme.switch = (theme) => {
    theme = theme || (app.theme.get() == 'light' ? 'dark' : 'light')
    app.utils.ls('theme.mode', theme)
    $('html').attr('data-theme', theme)
}


app.init = async () => {
    const pkrc = app.cache.pkrc = window.pkrc
    let frontmatter = {}
    let searchdb = [], tags = [], cssvars = []

    try { searchdb = Object.values(JSON.parse(await app.utils.getData("/searchdb.json"))) } catch(e){ }
    try { frontmatter = JSON.parse(unescape($("meta[name=frontmatter]").prop("content"))) } catch(e){ }
    try { tags = JSON.parse(unescape($("meta[name=tags]").prop("content"))) } catch(e){ }

    app.cache.config = app.utils.merge(pkrc, frontmatter)
    app.cache.frontmatter = frontmatter
    app.cache.searchdb = searchdb
    app.cache.tags = tags
    
    app.cfg = (key, fallback) => (app.utils.getValue(app.cache.config, key) || fallback)

    const ui = await app.ui.create(app)
    await app.plugins.init(app)
    await ui.render(app)
    const run = await app.plugins.run(app)
}





export default app
