if(!self.define){let s,e={};const t=(t,i)=>(t=new URL(t+".js",i).href,e[t]||new Promise((e=>{if("document"in self){const s=document.createElement("script");s.src=t,s.onload=e,document.head.appendChild(s)}else s=t,importScripts(t),e()})).then((()=>{let s=e[t];if(!s)throw new Error(`Module ${t} didn’t register its module`);return s})));self.define=(i,c)=>{const r=s||("document"in self?document.currentScript.src:"")||location.href;if(e[r])return;let d={};const a=s=>t(s,r),o={module:{uri:r},exports:d,require:a};e[r]=Promise.all(i.map((s=>o[s]||a(s)))).then((s=>(c(...s),d)))}}define(["./workbox-5b385ed2"],(function(s){"use strict";s.setCacheNameDetails({prefix:"text2lesson"}),self.addEventListener("message",(s=>{s.data&&"SKIP_WAITING"===s.data.type&&self.skipWaiting()})),s.precacheAndRoute([{url:"assets/styles/candy.css",revision:"d63b834bd753328e5527ddc2a5f0d14d"},{url:"assets/styles/cards.css",revision:"ee2dfc9289074a9d9392b99f86ee442c"},{url:"assets/styles/lessons.css",revision:"df95db014a0846498973490f1ee4d98d"},{url:"assets/styles/printable-lesson.css",revision:"f9066f5088bc42396a4a38ae0524dd70"},{url:"assets/styles/style.css",revision:"e2c15aab3464fecea3850170833e0519"},{url:"assets/styles/utils-controls.css",revision:"43a2ea9c41709be2a123007f6e7233e5"},{url:"assets/styles/utils-dialogs.css",revision:"dac932adfc1b09acfb0a914bf7890bde"},{url:"assets/styles/utils-icons.css",revision:"87acc0e0df0d072d698f98359f8f36e2"},{url:"assets/styles/utils-menu.css",revision:"ce1f245d67210c5c05a773c8d2bb6a19"},{url:"assets/styles/utils.css",revision:"0a3b58ee41ad050d929f2d67c67d1160"},{url:"assets/third-party/font-awesome/css/brands.min.css",revision:"120cd1fc94476fc0d8df485f8f937e20"},{url:"assets/third-party/font-awesome/css/fontawesome.min.css",revision:"835b264d24ffdf8fe3800a61266fa76a"},{url:"assets/third-party/font-awesome/css/solid.min.css",revision:"7c68b1b1aad853b83d0c29a5eefc6eb5"},{url:"index.html",revision:"ba1178d089e6b7703d1484074c1c41ef"},{url:"text2lesson.js",revision:"dfc91e18026fdd49d74bc0e0c33132c7"}],{})}));
//# sourceMappingURL=sw.js.map
