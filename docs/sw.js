if(!self.define){let s,e={};const t=(t,c)=>(t=new URL(t+".js",c).href,e[t]||new Promise((e=>{if("document"in self){const s=document.createElement("script");s.src=t,s.onload=e,document.head.appendChild(s)}else s=t,importScripts(t),e()})).then((()=>{let s=e[t];if(!s)throw new Error(`Module ${t} didn’t register its module`);return s})));self.define=(c,i)=>{const r=s||("document"in self?document.currentScript.src:"")||location.href;if(e[r])return;let a={};const l=s=>t(s,r),o={module:{uri:r},exports:a,require:l};e[r]=Promise.all(c.map((s=>o[s]||l(s)))).then((s=>(i(...s),a)))}}define(["./workbox-5b385ed2"],(function(s){"use strict";s.setCacheNameDetails({prefix:"text2lesson"}),self.addEventListener("message",(s=>{s.data&&"SKIP_WAITING"===s.data.type&&self.skipWaiting()})),s.precacheAndRoute([{url:"assets/styles/candy.css",revision:"d63b834bd753328e5527ddc2a5f0d14d"},{url:"assets/styles/cards.css",revision:"6374ce6181db56a16a10732fcca938da"},{url:"assets/styles/lessons.css",revision:"b287728404a1bed4984d6c55b5d8a5bf"},{url:"assets/styles/mathml.css",revision:"945832b2be079ebb363df6a4dc6aa9c5"},{url:"assets/styles/printable-lesson.css",revision:"e454172b2db6514acea27e8c2b182ce3"},{url:"assets/styles/style.css",revision:"b0b4c4ce202b5affdc30b960929ce206"},{url:"assets/styles/utils-controls.css",revision:"c9a71fd513b9a8cb0f0a6959623a48a7"},{url:"assets/styles/utils-dialogs.css",revision:"dac932adfc1b09acfb0a914bf7890bde"},{url:"assets/styles/utils-icons.css",revision:"67e63078ed6c612551e8762739207e15"},{url:"assets/styles/utils-menu.css",revision:"ce1f245d67210c5c05a773c8d2bb6a19"},{url:"assets/styles/utils.css",revision:"6b8e2108f3fe877f9d713323445038ac"},{url:"assets/third-party/font-awesome/css/brands.min.css",revision:"120cd1fc94476fc0d8df485f8f937e20"},{url:"assets/third-party/font-awesome/css/fontawesome.min.css",revision:"835b264d24ffdf8fe3800a61266fa76a"},{url:"assets/third-party/font-awesome/css/solid.min.css",revision:"7c68b1b1aad853b83d0c29a5eefc6eb5"},{url:"index.html",revision:"ba1178d089e6b7703d1484074c1c41ef"},{url:"text2lesson.js",revision:"b6540f8054abccfc0b26db09ebf5c06b"}],{})}));
//# sourceMappingURL=sw.js.map
