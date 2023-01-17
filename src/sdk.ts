import PK from "./pk";

(async () => {
  const pk: ObjectAny = (window.pk = new PK());
  await pk.init();

  try {
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/jquery@3.6.1/dist/jquery.min.js";
    script.onload = function () {
      (async () => {
        while (!pk.ready) await new Promise((solve) => setTimeout(solve, 200));
        if (!pk.error) $.ajax({ url: `${pk.url}/pk.js`, dataType: "script" });
        else pk.unregistered();
      })();
    };

    document.head.appendChild(script);
  } catch (e) {
    alert(e.message);
  }
})();
