import PK from "./pk";

(async () => {
  const pk: ObjectAny = (window.pk = new PK());
  await pk.init();

  try {
    const jquery = document.createElement("script");
    jquery.src = "https://cdn.jsdelivr.net/npm/jquery@3.6.1/dist/jquery.min.js";
    jquery.onload = function () {
      (async () => {
        while (!pk.ready || !window.less) await new Promise((solve) => setTimeout(solve, 200));
        if (!pk.error) $.ajax({ url: `${pk.url}/pk.js`, dataType: "script" });
        else pk.unregistered();
      })();
    };

    const less = document.createElement("script");
    less.src = "https://cdn.jsdelivr.net/npm/less@latest/dist/less.min.js";

    document.head.appendChild(less);
    document.head.appendChild(jquery);
  } catch (e) {
    alert(e.message);
  }
})();
