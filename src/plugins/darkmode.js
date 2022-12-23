const plugin = { id: 'darkmode' }

plugin.ui = async (options, app) => {

    const icon = `<i class="bx bxs-moon bx-sm moon" onclick="app.theme.switch('dark')"></i>
    <i class="bx bx-sun bx-sm sun" onclick="app.theme.switch('light')"></i>`


    app.ui.set('darkmode-icon', icon)
    app.ui.push('header-icons', app.ui.get('darkmode-icon'))
}

export default plugin