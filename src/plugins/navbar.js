const plugin = { id: 'navbar' }
const helpers = plugin.helpers = {}


plugin.init = async (options, app) => {
    const html = await app.utils.getData('/navbar') 
    const items = app.utils.array.fromUl(html)
    return items.length ? { items } : false
}

plugin.ui = async (options, app) => {
    const string = app.utils.handlebar(`<nav id="navbar" class="">
        {{#each items}} 
        <details {{#if isOpen}}open="true"{{/if}}>
            <summary>{{this.label}}</summary>
            <ul>
            {{#each items}} 
                <li class="d-flex align-items-center">
                    {{#if this.[1]}}
                    <i class='bx bx-{{this.[1]}} me-2'></i>
                    {{else}}
                    <i class='bx bx-chevron-right me-2'></i>
                    {{/if}}
                    {{{this.[0]}}}
                </li>
            {{/each}}
            </ul>
        </details>
        {{/each}}
    </nav>`, options._data)

    const icon = `<i id="navbar-icon" class="bx-fw bx bx-menu bx-sm ham"></i>`

    app.ui.set('navbar', string)
    app.ui.set('navbar-icon', icon)

    app.ui.push('left', app.ui.get('navbar'))
    app.ui.push('header-icons', app.ui.get('navbar-icon'))
}

plugin.code = async (options, app) => {

    // set aria-current if url match nav links
    if(window.location.pathname == '/') $('a[href="/index"]').attr("aria-current", "")
    else $('a[href="'+window.location.pathname+'"], a[href="'+window.location.pathname+'/index"], a[href="'+window.location.pathname+'.html"], a[href="'+window.location.pathname+'/index.html"]').attr("aria-current", "")
        
    // bind nav menu icon
    $("#navbar-icon").click(function(e) {
        e.preventDefault()
        helpers.toggle()
    })

    // theme
    $("#navbar li a").addClass('secondary')
}



plugin.helpers.toggle = () => {
    $('#navbar-icon').toggleClass('open')
    $('#navbar').toggleClass('open')
}


export default plugin