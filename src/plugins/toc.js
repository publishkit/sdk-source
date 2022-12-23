const plugin = { id: 'toc' }

plugin.init = async (options, app) => {

    const content = app.ui.get('content')
    const dom = $('<div/>').html(content)
    const headings = dom.find('>h1, >h2, >h3')

    if(headings.length <= 1) return

    headings.map(function(){ this.id = 'heading-'+app.utils.slugify($(this).text()) })

    app.ui.set('content', dom.html())
    return true
}

plugin.ui = async (options, app) => {
    app.ui.set('toc', '<ul id="toc"></ul>')
    app.ui.push('right', app.ui.get('toc'))
}

plugin.code = async (options, app) => {

    const headings = $('[id^="heading-"]')
    const links = headings.map(function(){ 
        return `<li><a href="#${this.id}" class="secondary is-${this.tagName.toLowerCase()}">${$(this).text()}</a></li>`
    }).toArray().join('')

    const scrollTo = (el) => app.utils.scrollTo(el, 90, 600)
    
    $('#toc').html(links).on("click", "a", function(e) {
        e.preventDefault()
        scrollTo(this.getAttribute('href'))
        window.location.hash = this.getAttribute('href')
    })

    // scrollspy
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const isVisible = entry.isIntersecting
            const id = entry.target.getAttribute('id')
            const item = document.querySelector('a[href="#'+ id +'"]')
            $(item).parent().toggleClass('is-visible', isVisible)
        })
    })
    headings.toArray().map(area => {
        observer.observe(area)
    })

    // autoscroll to hash
    const hash = window.location.hash || ''
    if(hash.startsWith('#heading-')) setTimeout(() => { scrollTo(hash) }, 0)

}

export default plugin