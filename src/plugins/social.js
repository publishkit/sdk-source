const plugin = { id: 'social' }



plugin.ui = async (options, app) => {

    const string = `<div>
        ${app.cfg('social.github')    && `<a target="_new" href="${app.cfg('social.github')}" class="secondary"><i class='bx bxl-github bx-xs'></i></a>` || ''}
        ${app.cfg('social.discord')    && `<a target="_new" href="${app.cfg('social.discord')}" class="secondary"><i class='bx bxl-discord-alt bx-xs'></i></a>` || ''}
        ${app.cfg('social.twitter')   && `<a target="_new" href="${app.cfg('social.twitter')}" class="secondary"><i class='bx bxl-twitter bx-xs'></i></a>` || ''}
        ${app.cfg('social.linkedin')  && `<a target="_new" href="${app.cfg('social.linkedin')}" class="secondary"><i class='bx bxl-linkedin-square bx-xs'></i></a>` || ''}
        ${app.cfg('social.instagram') && `<a target="_new" href="${app.cfg('social.instagram')}" class="secondary"><i class='bx bxl-instagram bx-xs'></i></a>` || ''}
        ${app.cfg('social.twitch')    && `<a target="_new" href="${app.cfg('social.twitch')}" class="secondary"><i class='bx bxl-twitch bx-xs'></i></a>` || ''}
        ${app.cfg('social.facebook')  && `<a target="_new" href="${app.cfg('social.facebook')}" class="secondary"><i class='bx bxl-facebook-circle bx-xs'></i></a>` || ''}
        ${app.cfg('social.reddit')    && `<a target="_new" href="${app.cfg('social.reddit')}" class="secondary"><i class='bx bxl-reddit bx-xs'></i></a>` || ''}
    </div>`

    app.ui.set('social', string)

    app.ui.push('footer', app.ui.get('social'))
}


export default plugin