const plugin = { id: 'cdnfonts' }

plugin.code = async (options, app) => {

    const { font='' } = options
    const f = font.trim().replaceAll(' ','-').toLowerCase()

    app.utils.addStylesheet(`https://fonts.cdnfonts.com/css/${f}`)
    app.utils.cssvar('--font-family', `${font}, sans-serif`)
}

export default plugin