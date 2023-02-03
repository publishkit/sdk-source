import Utils from "./utils/index";
import App from "./app";

import "./css/vars.less";
import "./css/app.less";
import "./css/utils.less";

const $app = window.$app = new App();
console.log(Utils.s.banner());

(async function () {
  await $app.init();
})();
