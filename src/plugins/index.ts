import dom from "./dom";
import global from "./global";
import props from "./props";
import actions from "./actions";
import render from "./render";
import header from "./header";
import css from "./css";
import hotkeys from "./hotkeys";
import modal from "./modal";
import search from "./search";
import darkmode from "./darkmode";
import navbar from "./navbar";
import toc from "./toc";
import cards from "./cards";
import frontmatter from "./frontmatter";
import highlight from "./highlight";
import social from "./social";
import pdf from "./pdf";
import breadcrumbs from "./breadcrumbs";
import hero from "./hero";
import bg from "./bg";

const plugins: ObjectAny = {
  dom,
  global,
  props,
  actions,
  render,
  hotkeys,
  header,
  modal,
  search,
  darkmode,
  navbar,
  toc,
  cards,
  frontmatter,
  highlight,
  social,
  pdf,
  breadcrumbs,
  hero,
  bg,
  css,
};

export default plugins;
