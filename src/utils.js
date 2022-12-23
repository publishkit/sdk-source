
const utils = window.Utils = {}
export default utils


const isObject = utils.isObject = (item) => {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

utils.merge = (target, ...sources) => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        utils.merge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return utils.merge(target, ...sources);
}

utils.urlParams = new URLSearchParams(window.location.search)

utils.handlebar = (str, data) => {
  try { return Handlebars.compile(str)(data) }
  catch(e){ console.log('handlebar:error', e); return '' }
}

utils.getData = async (path) => {
  const myRequest = new Request(`${path}`)
  const res = await fetch(myRequest)
  return res.ok ? res.text() : ''
}

utils.loadScript = async (path, isAsync=true) => Promise.all(utils.asArray(path).map(path => new Promise((success, error) => {
    $.ajax({
        async: isAsync,
        url: path,
        dataType: "script",
        success,
        error
    })
})))

// https://fsymbols.com/generators/carty/
utils.banner = () => {
  return `
  █▀█ █░█ █▄▄ █░░ █ █▀ █░█   █▄▀ █ ▀█▀
  █▀▀ █▄█ █▄█ █▄▄ █ ▄█ █▀█   █░█ █ ░█░ .dev`
}



/* DOM */



utils.addScript = async (path, props, target) => Promise.all(utils.asArray(path).map(path => new Promise((success, error) => {
  target = target || document.head
  const tag = utils.scriptEl(path, props)
  target.append(tag)
})))

utils.addStylesheet = async (path, props, target) => Promise.all(utils.asArray(path).map(path => new Promise((success, error) => {
  target = target || document.head
  const tag = utils.cssEl(path, props)
  target.append(tag)
})))

utils.scriptEl = (src, props) => {
    src = src.trim()
    const s = document.createElement("script")
    s.type = "text/javascript"
    s.crossorigin="anonymous"
    if(src.startsWith('http') || src.startsWith('//')) s.src = src
    else s.innerHTML = src
    if(props) Object.keys(props).map(k => s.setAttribute(k, props[k]))
    return s
}

utils.cssEl = (href, props) => {
  const s = document.createElement("link")
  s.rel = "stylesheet"
  s.crossorigin="anonymous"
  s.href = href
  if(props) Object.keys(props).map(k => s.setAttribute(k, props[k]))
  return s
}

utils.titleEl = (title) => {
    const s = document.createElement("title")
    s.innerHTML = title
    return s
}

utils.waitForEl = (selector) => {
  return new Promise(resolve => {
      if (document.querySelector(selector)) {
          return resolve(document.querySelector(selector))
      }

      const observer = new MutationObserver(mutations => {
          if (document.querySelector(selector)) {
              resolve(document.querySelector(selector))
              observer.disconnect()
          }
      })

      observer.observe(document.body, {
          childList: true,
          subtree: true
      })
  })
}

utils.cssvar = (key, value) => document.documentElement.style.setProperty(key, value)

utils.reloadStylesheets = () => {
  var links = document.getElementsByTagName("link")
  for (var cl in links){
      var link = links[cl]
      if (link.rel === "stylesheet") link.href += ""
  }
}

/* Elements */


utils.el = {}

// rename every props on documents
// renameProp('data-target', 'onclick')
utils.el.renameProp = (from, to) => $('['+from+']').each(function() {
    const el = $(this)
    el.attr({ [to]: el.attr(from)})
      .removeAttr(from)
  })



/* Storage */

// local storage
utils.ls = function(key, value) {
    if (localStorage == null) return console.log('Local storage not supported!')
    else {
      try {
        let result
        if (typeof value != 'undefined') {
          localStorage.setItem(key, value)
          result = value
        } else {
          result = (value === null) ? localStorage.removeItem(key) : localStorage.getItem(key)
        }
        return result.replace(/(\r\n|\n|\r)/gm, "")
      } catch(err) {
        const private_browsing_error = 'Unable to store local data. Are you using Private Browsing?'
        console.log(/QUOTA_EXCEEDED_ERR/.test(err) ? private_browsing_error : err)
      }
    }
  }


/* Arrays */

utils.asArray = (input, { delim = ',', trim = true, uniq = true, compact = true } = {}) => {
	let output = typeof input == 'string'
		? input.split(delim)
		: input || []

	if(trim) output = output.map(v => v?.trim?.() || v)
	if(compact) output = output.filter(Boolean)
	if(uniq) output = [...new Set(output)]

	return output
}


utils.array = {}


// flaten, truthy, unique
utils.array.clean = (array) => utils.array.unique(array.flat().filter(Boolean))

utils.array.unique = (array) => {
  var a = array.concat()
  for(var i=0; i<a.length; ++i) {
      for(var j=i+1; j<a.length; ++j) {
          if(a[i] === a[j])
              a.splice(j--, 1)
      }
  }
  return a
}
  
// extract value from html
utils.array.fromUl = (html) => {
    const dom = new DOMParser().parseFromString(html, 'text/html')
    const root = dom.querySelector('ul')
    const array = []
    for (const el of $(root).find('> li')) {
        
        const label = $(el).clone()
            .children().remove() 
            .end().text().trim()

        const isOpen = !$(el).find('[type="checkbox"][checked=""]')[0]

        const items = []
        $(el).find('ul li').map(function(){ 
          const item = $(this).html().split('||').map(slot => (slot||'').trim())
          items.push(item) 
        })

        const section = { label, isOpen, items }

        array.push(section)
    }
    return array
}



// ex: wrapWordsAtIndexes('brave new world', [[0,5], [10, 15]], '<bold>', '</bold>') => '<bold>brave</bold> new <bold>world</bold>'
utils.wrapWordsAtIndices = (str, idx, before='<mark>', after='</mark>') => idx.reduceRight((s,[start, end]) => `${s.slice(0, start)}${before}${s.slice(start,end+1)}${after}${s.slice(end+1)}`, str)


// ex: getBetweenRanges([[9,13], [17, 22], [34, 40]], 2)
// =>: [[13,17], [22, 34]]
const getBetweenRanges = (idx, ranges=[]) => {
	for (let i = 0; i < idx.length; i++) {
    const crange = idx[i]
    const nrange = idx[i+1]
    if(nrange) ranges.push([crange[1], nrange[0]])
   }
   return ranges
}

// ex: replaceRange('hello my name is bruce wayne', 9, 13, 'pseudo')
// =>: 'hello my pseudo is bruce wayne'
const replaceRange = (str, start, end, substitute) => {
    return str.substring(0, start) + substitute + str.substring(end)
}

// ex: getWordsAtIndexes('hello my name is bruce wayne', [[9,13], [17, 22]])
// =>: ['name', 'bruce]
const getWordsAtIndexes = (str, idx, words=[]) => {
	for (let i = 0; i < idx.length; i++) {
    const range = idx[i]
    words.push(str.substring(range[0], range[1]))
   }
   return words
}

// ex: substractIndices([[9,13], [17, 22]], 2)
// =>: [[7,11], [15, 20]]
const substractIndices = (idx, by=1, ranges=[]) => {
	for (let i = 0; i < idx.length; i++) {
    const range = idx[i]
    ranges.push([range[0]-by, range[1]-by])
   }
   return ranges
}

// ex: truncateAtIndexes('hello my name is bruce wayne', [[3,5], [10, 12], [20, 22]])
// =>: { str: "lo*am*ce",  idx: [[0, 2], [3, 5], [6, 8]] }
utils.truncateAtIndices = (str='', idx, sep='*', padding=0) => {
  
	const min = idx[0][0]
  if((min - padding) > 0){
  	str = str.substring(min-padding)
    idx = substractIndices(idx, min - padding)
  }
  
  const max = idx[idx.length-1][1]
  if((str.length - max) > padding) str = str.substring(0, max + padding)
    
  const handle = (r, i=0) => {
    if(!r.length) return
  	const [start, end] = r[i]
    
    if((end-start) > (padding * 2)){
    	const sub = str.substring(start, end)
      const before = sub.substr(0, padding)
      const after = sub.substr(sub.length - padding)
      const text = `${before}${sep}${after}`
    	const nbCharsToRemove = sub.length - text.length
      const startArray = idx.slice(0, i+1)
      const endArray = idx.slice(-(idx.length-(i+1)))
      const restArray = substractIndices(endArray, nbCharsToRemove)
      str = replaceRange(str, start, end, text)
      idx = startArray.concat(restArray)
    }
    if(ranges[i+1]){
    	ranges = getBetweenRanges(idx)
      handle(ranges, i+1)
    }
  }
  
  let ranges = getBetweenRanges(idx)
  handle(ranges, 0)
   
  return { str, idx }
}


// https://stackoverflow.com/questions/74674559/truncate-portions-of-a-string-found-between-a-regex-pattern#74675305
// ex: f('lorem <mark>ipsum</mark> dolor <mark>amer</mark> sipiu', '<mark>.+?</mark>', 2, '...')
// =>: '...m <mark>ipsum</mark> d...r <mark>amer</mark> s...'
utils.truncateBetweenPattern = (str, pattern, padding=0, sep='...') => {
  const re = [
      RegExp(`^().+?(.{${padding}})$`, "s"),
      RegExp(`^(.{${padding}}).+?(.{${padding}})$`, "s"),
      RegExp(`^(.{${padding}}).+?()$`, "s")
  ];
  const parts = str.split(RegExp(`(${pattern})`, "s"));
  return parts.length < 2 ? str
      : parts.map((part, i, {length}) =>
    i % 2 ? part : part.replace(re[(i > 0) + (i == length - 1)], `$1${sep}$2`)
  ).join("");
}


utils.slugify = (text) => {
  return text
    .toString()                   // Cast to string (optional)
    .normalize('NFKD')            // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
    .toLowerCase()                // Convert the string to lowercase letters
    .trim()                       // Remove whitespace from both sides of a string (optional)
    .replace(/\s+/g, '-')         // Replace spaces with -
    .replace(/[^\w\-]+/g, '')     // Remove all non-word chars
    .replace(/\_/g,'-')           // Replace _ with -
    .replace(/\-\-+/g, '-')       // Replace multiple - with single -
    .replace(/\-$/g, '');         // Remove trailing -
}


utils.isDark = () => (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : ''
utils.isMac = () => navigator.platform.indexOf('Mac') > -1
utils.isWindows = () => navigator.platform.indexOf('Win') > -1
utils.scrollTo = (el, offset=0, to) => $('html, body').animate({ scrollTop: $(el).offset().top - offset }, to)
utils.pageHeight = () => {
  const body = document.body, html = document.documentElement
  return Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight )
}






// dot notation object get
utils.getValue = (obj, path) => (
  path.split('.').reduce((acc, part) => acc && acc[part], obj)
)


$.throttle = function( delay, no_trailing, callback, debounce_mode ) {
  let timeout_id, last_exec = 0
  
  if ( typeof no_trailing !== 'boolean' ) {
    debounce_mode = callback;
    callback = no_trailing;
    no_trailing = undefined;
  }
  
  function wrapper() {
    let that = this,
      elapsed = +new Date() - last_exec,
      args = arguments;
    
    function exec() {
      last_exec = +new Date()
      callback.apply( that, args )
    }

    function clear() { timeout_id = undefined }
    
    if (debounce_mode && !timeout_id) exec()
    
    timeout_id && clearTimeout(timeout_id)
    
    if (debounce_mode === undefined && elapsed > delay) exec()
    else if ( no_trailing !== true ) timeout_id = setTimeout(debounce_mode ? clear : exec, debounce_mode === undefined ? delay - elapsed : delay)
  }

  if ( $.guid ) wrapper.guid = callback.guid = callback.guid || $.guid++
  
  return wrapper;
}



$.debounce = function( delay, at_begin, callback ) {
  return callback === undefined
    ? $.throttle(delay, at_begin, false)
    : $.throttle(delay, callback, at_begin !== false)
};