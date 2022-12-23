
const plugin = { id: 'search' }

plugin.deps = ['https://cdn.jsdelivr.net/npm/minisearch@6.0.0/dist/umd/index.min.js']


plugin.init = async (options, app) => {
    return app.cache.searchdb.length
}


plugin.ui = async (options, app) => {
    const modal = `<dialog id="search">
        <article>
            <input id="search-input" type="search" placeholder="search" accesskey="k" value="${app.utils.urlParams.get('s')||''}" />
            <ul id="search-list"></ul>
            <div id="search-help" class="d-flex justify-content-between">
                <ul class="d-flex">
                    <li>
                    <kbd><svg width="15" height="15" aria-label="Enter key" role="img"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"><path d="M12 3.53088v3c0 1-1 2-2 2H4M7 11.53088l-3-3 3-3"></path></g></svg></kbd>
                    <span>to select</span>
                    </li>
                    <li>
                    <kbd><svg width="15" height="15" aria-label="Arrow down" role="img"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"><path d="M7.5 3.5v8M10.5 8.5l-3 3-3-3"></path></g></svg></kbd><kbd><svg width="15" height="15" aria-label="Arrow up" role="img"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"><path d="M7.5 11.5v-8M10.5 6.5l-3-3-3 3"></path></g></svg></kbd>
                    <span>to navigate</span>
                    </li>
                    <li>
                    <kbd><svg width="15" height="15" aria-label="Escape key" role="img"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"><path d="M13.6167 8.936c-.1065.3583-.6883.962-1.4875.962-.7993 0-1.653-.9165-1.653-2.1258v-.5678c0-1.2548.7896-2.1016 1.653-2.1016.8634 0 1.3601.4778 1.4875 1.0724M9 6c-.1352-.4735-.7506-.9219-1.46-.8972-.7092.0246-1.344.57-1.344 1.2166s.4198.8812 1.3445.9805C8.465 7.3992 8.968 7.9337 9 8.5c.032.5663-.454 1.398-1.4595 1.398C6.6593 9.898 6 9 5.963 8.4851m-1.4748.5368c-.2635.5941-.8099.876-1.5443.876s-1.7073-.6248-1.7073-2.204v-.4603c0-1.0416.721-2.131 1.7073-2.131.9864 0 1.6425 1.031 1.5443 2.2492h-2.956"></path></g></svg></kbd>
                    <span>to close</span>
                    </li>
                </ul>
            </div>
        </article>
    </dialog>`

    const btn = `<div id="search-btn">
        <button type="button" onclick="$('#search').modal('', ()=>{ $('#search-input').focus() })" class="secondary outline d-flex justify-content-between align-items-center">
            <span class="d-flex align-items-center">
                <i class="bx bx-search"></i>
                <span class="text">Search</span>
            </span>
            <span><kbd><span class="symbol">⌘</span>K</kbd></span>
        </button>
    </div>`

    const icon = `<i id="search-icon" class="bx-fw bx bx-search bx-sm search" onclick="$('#search').modal('', ()=>{ $('#search-input').focus() })"></i>`

    app.ui.set('search-modal', modal)
    app.ui.set('search-btn', btn)
    app.ui.set('search-icon', icon)

    app.ui.push('modals', app.ui.get('search-modal'))
    app.ui.push('header-icons', app.ui.get('search-btn'))
    app.ui.push('header-icons', app.ui.get('search-icon'))
}


plugin.code = async(opt, app) => {

    const options = {
        padding: app.cfg('search_padding', 15),
        fuzzy: app.cfg('search_fuzzy', .2),
        chars: app.cfg('search_chars', 3),
        max_results: app.cfg('search_max_results', 5),
    }

    const idx = new MiniSearch({
        fields: ['title', 'content'], // fields to index for full-text search
        storeFields: ['title', 'content', 'path'] // fields to return with search results
    })

    const db = app.cache.searchdb
    
    // add id to dataset
    db.map((item, i) => (db[i].id = i))
    // add dataset to index
    idx.addAll(db)
    
    
    const searchEl = $('#search-input')
    const searchList = $('#search-list')
    let results = []
    
    const selectResult = () => {
        const selectedIndex = searchList.find(".selected").index()
        const url = results[selectedIndex]
        window.location = `/${url}`
    }
    
    const highlight = (terms, str) => {
        var re = new RegExp(terms.join("|"),"gi");
        return str.replace(re, (matched) => `<mark>${matched}</mark>`)
    }

    const getsTerms = (terms, match, field) => {
        const result = []
        terms.map(t => {
            if(match[t].includes(field)) result.push(t)
        })
        return result
    }

    const makeSearch = (_, str='') => {
        const value = (searchEl.val()||'').trim()
        results = [] // reset global results

        if(value && value.length >= options.chars){
            const searchResults = idx.search(value, { prefix: true, fuzzy: options.fuzzy, boost: { title: 2 } })
            console.log('search', value, searchResults)
            searchResults.map((r, i) => {
                const titleTerms = getsTerms(r.terms, r.match, 'title')
                const contentTerms = getsTerms(r.terms, r.match, 'content')
                const title = titleTerms.length ? highlight(titleTerms, r.title) : r.title
                const content = contentTerms.length ? app.utils.truncateBetweenPattern( highlight(contentTerms, r.content), '<mark>.+?</mark>', options.padding, ' ... ') : ''
                str += `<li class="${i==0?'selected':''}">
                    <div><i class='bx bx-file-blank' ></i> ${title}</div>
                    <div>${content}</div>
                </li>`
                results.push(r.path)
            })
        }

        searchList.html(str)
    }

    // init search if "s" param is present in url
    if(app.utils.urlParams.get('s')||''){
        makeSearch()
        $('#search').modal('', () => { $('#search-input').focus() })
    }
    

    searchEl
        .on('input', $.debounce(1000, makeSearch))
        // .blur(function() { searchList.hide() })
        // .focus(function() { searchList.show() })


    searchEl.on('keydown', (function(e) {
        if(!results.length) return

        if (e.keyCode == 13) { // enter
            selectResult()
        }
        if (e.keyCode == 38) { // up
            const selected = searchList.find(".selected")
            searchList.find("li").removeClass("selected")
            if(!selected.length) searchList.find("li").last().addClass("selected")
            else if (selected.prev().length == 0) selected.siblings().last().addClass("selected")
            else selected.prev().addClass("selected")
        }
        if (e.keyCode == 40) { // down
            const selected = searchList.find(".selected")
            searchList.find("li").removeClass("selected")
            if(!selected.length) searchList.find("li").first().addClass("selected")
            else if (selected.next().length == 0) selected.siblings().first().addClass("selected")
            else selected.next().addClass("selected")
        }
    }))

    searchList.on("mouseover", "li", function() {
        searchList.find("li").removeClass("selected")
        $(this).addClass("selected")
    })

    searchList.on("click", "li", function() {
        selectResult()
    })

    hotkeys('command+k', function (event, handler){
        $('#search').modal('', () => { $('#search-input').focus() })
    })

}

export default plugin