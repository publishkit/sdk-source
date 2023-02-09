import utils from "./utils/index";
import app from "./class/app";

import "./css/vars.less";
import "./css/app.less";
import "./css/utils.less";

const $app = (window.$app = new app());
console.log(utils.s.banner());

(async function () {
  try {
    await $app.init();
  }catch(e){
    console.log("top level error", e)
  }
})();
