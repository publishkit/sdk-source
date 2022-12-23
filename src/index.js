import Utils from './utils.js'
import app from './app.js'
import Plugins from './plugins.js'
import UI from './ui.js'

import './css/vars.css' 
import './css/app.css'
import './css/utils.css'

window.app = app
app.utils = Utils
app.plugins = Plugins
app.ui = UI 

console.log(Utils.banner())
const css = ["https://cdn.jsdelivr.net/npm/@picocss/pico@1.5.6/css/pico.min.css", `${window.pk.url}/pk.css`]
const theme = (window.pkrc.site.theme || '').trim()


;(async function() {
    Utils.addStylesheet(css)
    if(theme && theme!='default') Utils.addStylesheet(`/_publishkit/themes/${theme}.css`, { name: 'theme' })

    $('html').attr('data-theme', app.theme.get()) // set theme
    $('body').append('<div id="spinner" class="text-center mt-5"><progress style="width: 100px"></progress></div>') // add spinner
    document.getElementsByTagName('progress')[0].indeterminate = true // spin
    await app.init()
    $('#spinner').remove()
    $('#content').show()
})()
