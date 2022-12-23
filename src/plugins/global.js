const plugin = { id: 'global' }

plugin.deps = ["https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.js"]
plugin.css = ["https://cdn.jsdelivr.net/npm/boxicons@2.1.4/css/boxicons.min.css"]


plugin.code = async (options, app) => {

    // global click listener
    $(document).on('click', event => {
        const target = event.target

        // close modal
        if(window.modal){
            // const searchBtn = $(target).parents('#search-btn').length
            // const searchIcon = ($(target).attr('class')||'').indexOf('search') >= 0
            const modalContent = window.modal[0].querySelector('article').contains(target)
            // if(!(searchBtn || searchIcon || modalContent)) window.modal.prop('open', false)
            if(!(modalContent)) window.modal.prop('open', false)
        }

        // close menu if open
        if($('#navbar.open')[0]){
            const isIcon = target.id=='navbar-icon'
            const isNav = $(target).parents('#navbar').length
            if(!(isIcon || isNav)) app.plugins.get('navbar').helpers.toggle()
        }

    })

    // onclick prop is not passed in html in obsidian, so we use data-click and then rename it here
    app.utils.el.renameProp('data-click', 'onclick') 
    
    // tables
    $( "table" ).wrap("<figure></figure>")  // make tables scrollable
    for (const el of document.querySelectorAll('table')) el.setAttribute('role', 'grid') // make table striped
    
    // for (const el of document.querySelectorAll('img')) el.setAttribute('class', 'img-fluid')
    if(app.cfg('doc.pdf_notoolbar')) for (const el of document.querySelectorAll('.pdf-embed iframe')){
        const src = el.getAttribute('src') + '#toolbar=0'
        el.setAttribute('src', '')
        setTimeout(() => el.setAttribute('src', src), 10)
    }

    // callouts
    $('.callout-title:has(.callout-fold)').on('click', function(){
        $(this).next().toggle()
    })
    
}



export default plugin