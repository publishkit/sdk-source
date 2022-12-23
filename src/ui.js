
const ui = {}

ui.cache = {}


ui.create = async (app) => {
    
    ui.set = (key, value) => (ui.cache[key] = value)
    ui.push = (key, value) => { ui.cache[key].push(value) }
    ui.pushStart = (key, value) => { ui.cache[key].unshift(value) }
    ui.get = (key) => {
        const keys = app.utils.asArray(key)
        if(keys.length == 1) return ui.cache[key]
        return keys.reduce((acc, key) => { acc[key] = ui.cache[key]; return acc; }, {})
    }


    ui.set('header-icons', [])
    ui.set('left', [])
    ui.set('right', [])
    ui.set('center', [])
    ui.set('footer', [])
    ui.set('modals', [])
    
    ui.set('content', document.getElementById('content').innerHTML)
    ui.set('copyright', `<span>${app.cfg('site.name', '')} © ${new Date().getFullYear()}</span>`)
    ui.set('poweredby', `<span class="poweredby">powered by</span> <a href="https://www.publishkit.app/" target="_new" class="contrast outline"><i class='bx bx-paper-plane'></i> PublishKit</a>`)
    
    ui.push('footer', ui.get('copyright'))

    return ui
}



ui.render = async (app) => {

    // hard ui
    ui.push('center', ui.get('content'))
    ui.push('footer', ui.get('poweredby'))




    const els = ui.get('header,left,right,center,footer,modals')

    const rx = {}

    rx.header = getHeader(app)

    rx.left = els.left.length && `<aside>
        <div class="left-bar">
            ${els.left.join('\n')}
        </div>
    </aside>` || ''
    
    rx.right = els.right.length && `<div>
        <div class="right-bar">
            ${els.right.join('\n')}
        </div>
    </div>` || ''

    rx.footer = els.footer.length && `<footer class="d-flex flex-column flex-md-row flex-lg-column flex-xl-row align-items-center justify-content-between">
        ${els.footer.map(el => `<div class="mb-2 mb-xl-0">${el}</div>`).join('\n')}
    </footer>` || ''

    rx.center = `<div role="document">
        ${els.center.join('\n')}
        ${rx.footer}
    </div>` || ''
    
    rx.modals = els.modals.length && `<div class="modals">${els.modals.join('\n')}</div>` || ''
    
    rx.layout = `
    ${rx.header}
    <main class="ready container${app.cfg('layout.fluid')?'-fluid':''}">
        ${rx.left}
        ${rx.center}
        ${rx.right}
        ${rx.modals}
    </main>`

    document.getElementById('content').innerHTML = rx.layout
    return await app.utils.waitForEl('main.ready')
}


const getHeader = (app) => {
    return app.utils.handlebar(`<nav id="header" class="container${app.cfg('layout.fluid')?'-fluid':''}">
        <ul>
            ${app.cfg('site.logo') && `<li style="padding: 0 inherit;"><a style="padding: 20px 0;" href="/" class="contrast" onclick="event.preventDefault()"><img class="logo" src="${app.cfg('logo')}"></img></a></li>` || '' }
            ${!app.cfg('site.logo') && `<li><a href="/" class="logo-text contrast"><strong>${app.cfg('site.name', 'Sitename')}</strong></a></li>` || '' }
        </ul>
        <ul>
        <li>
            ${app.ui.get('header-icons').join('\n')}
        </li>
        </ul>
    </nav>`)
}



export default ui