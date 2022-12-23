const plugin = { id: 'hotkeys' }

plugin.deps = ["https://cdn.jsdelivr.net/npm/hotkeys-js@3.7.3/dist/hotkeys.min.js"]


plugin.code = async (options, app) => {

    // enable hotkeys to work in inputs
    hotkeys.filter = function(event){
        const tagName = (event.target || event.srcElement).tagName
        hotkeys.setScope(/^(INPUT|TEXTAREA|SELECT)$/.test(tagName) ? 'input' : 'other')
        return true
    }

    // handle escape
    hotkeys('esc', function(event, handler){
        window.modal && window.modal.prop('open', false)
    })
}

export default plugin