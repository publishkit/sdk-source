;(async () => {
    try { window.pkrc = JSON.parse(await (await fetch("/pkrc.json")).text()) } 
    catch(e){ return alert('invalid/missing pkrc.json') }

    window.pk = {
        url: (localStorage.getItem('pk_url') || process.env.PK_URL).trim(),
        version: (window.pkrc.site.version || 'latest').trim(),
        api: process.env.PK_API
    }

    if(window.pk.version != 'latest') window.pk.url = window.pk.url.replace('@latest', `@${window.pk.version}`)


    const checkSite = async (site_id) => {
        try{
            const hostname = window.location.hostname
            if(hostname=='localhost') return true
            const siteID = 'rec_ce2thrqg1ibmhfpnqtdg' || window.pkrc.site.id
            if(!siteID) throw new Error(`missing site.id`)
            const r = await $.ajax(`${window.pk.api}/site?id=${siteID}`)
            if(r.site != hostname) throw new Error(`invalid PublihKit site.id "${siteID}"`)
            return true
        }catch(e){
            alert(e)
        }
    }

    if(await checkSite()) $(document).ready(async function() {
        $.ajax({ url: `${pk.url}/pk.js`, dataType: "script" })
    })
    
})()