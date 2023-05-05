import Kit from "./class/kit";

(async () => {
  const kit = window.kit = window.$kit = new Kit();
  await kit.init();
  try {
    const jquery = document.createElement("script");
    jquery.src = "https://cdn.jsdelivr.net/npm/jquery@3.6.1/dist/jquery.min.js";
    jquery.onload = function () {
      (async () => {
        while (!kit.ready || !window.less)
          await new Promise((solve) => setTimeout(solve, 200));
        if (!kit.error) $.ajax({ url: `${kit.url}/kit.js`, dataType: "script" });
        else kit.unregistered();
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
