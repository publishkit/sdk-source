import Utils from "./utils/index";
import App from "./app";

import "./css/vars.css";
import "./css/app.css";
import "./css/utils.css";

const app = (window.app = new App());
console.log(Utils.s.banner());

(async function () {
  app.theme.init(); // set theme
  $("html").attr("data-theme", app.theme.mode()); // set mode
  $("body").append('<div id="spinner" class="text-center mt-5"><progress style="width: 100px"></progress></div>'); // add spinner
  (document.getElementsByTagName("progress")[0] as any).indeterminate = true; // spin
  await app.init();
  $("#spinner").remove();
  $("#content").show();
})();
