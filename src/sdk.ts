(async () => {
  try {
    window.pkrc = JSON.parse(await (await fetch("/pkrc.json")).text());
  } catch (e) {
    window.pkrc = {};
  }

  const pk = (window.pk = {
    url: (localStorage.getItem("pk.url") || process.env.PK_URL || "").trim(),
    version: (
      localStorage.getItem("pk.version") ||
      window.pkrc.pk?.version ||
      "latest"
    ).trim(),
    folder: (
      localStorage.getItem("pk.folder") ||
      window.pkrc.pk?.folder ||
      "/_pk"
    ).trim(),
    api: process.env.PK_API,
    debug: localStorage.getItem("pk.debug") || "",
    ready: false,
    error: "",
  });

  if (pk.version != "latest")
    pk.url = pk.url.replace("@latest", `@${pk.version}`);

  (async () => {
    try {
      const hostname = window.location.hostname;
      if (hostname == "localhost") return (pk.ready = true);
      const siteID = window.pkrc.site?.id;
      if (!siteID) throw new Error(`missing site.id`);
      const r = await $.ajax(`${pk.api}/site?id=${siteID}`);
      if (r.site != hostname)
        throw new Error(`invalid PublihKit site.id "${siteID}"`);
      return (pk.ready = true);
    } catch (e) {
      console.log(e);
      pk.error = e.message;
      pk.ready = true;
    }
  })();

  var script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/jquery@3.6.1/dist/jquery.min.js";
  script.onload = function () {
    (async () => {
      while (!pk.ready) await new Promise((solve) => setTimeout(solve, 200));
      $.ajax({ url: `${window.pk.url}/pk.js`, dataType: "script" });
    })();
  };

  document.head.appendChild(script);
})();
