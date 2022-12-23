const plugin = { id: 'modal' }


plugin.code = async () => {

    window.modal = null

    $.fn.modal = function(action, cb = () => {}, cbb) {
        if(typeof cb == 'object'){
            cb.preventDefault()
            cb = cbb || (() => {})
        }
        let state = this.prop("open") ? false : true
        if(action=='show') state = true
        if(action=='hide') state = false
        // console.log('modal', state)
        setTimeout(() => {
            window.modal = state ? this : null
            this.prop('open', state)
            cb(state)
        }, 0)
    }
}

export default plugin