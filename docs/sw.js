if(!self.define){let s,e={};const c=(c,t)=>(c=new URL(c+".js",t).href,e[c]||new Promise((e=>{if("document"in self){const s=document.createElement("script");s.src=c,s.onload=e,document.head.appendChild(s)}else s=c,importScripts(c),e()})).then((()=>{let s=e[c];if(!s)throw new Error(`Module ${c} didn’t register its module`);return s})));self.define=(t,i)=>{const f=s||("document"in self?document.currentScript.src:"")||location.href;if(e[f])return;let r={};const a=s=>c(s,f),o={module:{uri:f},exports:r,require:a};e[f]=Promise.all(t.map((s=>o[s]||a(s)))).then((s=>(i(...s),r)))}}define(["./workbox-5b385ed2"],(function(s){"use strict";s.setCacheNameDetails({prefix:"text2lesson"}),self.addEventListener("message",(s=>{s.data&&"SKIP_WAITING"===s.data.type&&self.skipWaiting()})),s.precacheAndRoute([{url:"assets/styles/candy.css",revision:"2d244de6baef43cfb6cdb6b631441494"},{url:"assets/styles/cards.css",revision:"202590e432996df541bd306bf3e55f8a"},{url:"assets/styles/lessons.css",revision:"1607216cd55ccaa264f4b312b4c2d4bd"},{url:"assets/styles/style.css",revision:"ee4e21beb035fb6cb24dd01d8a6a16c4"},{url:"assets/styles/utils-controls.css",revision:"89066e3f2fedf8b08cac8c84d43ff638"},{url:"assets/styles/utils-dialogs.css",revision:"51bef65b8e202c67a9949ffca37ee591"},{url:"assets/styles/utils-icons.css",revision:"c0acd919e9534e0c0d1d0f655faae9f0"},{url:"assets/styles/utils-menu.css",revision:"181c587b474ae18a8c3b408efc4a3914"},{url:"assets/styles/utils.css",revision:"46015e5cf30037fefe6c8bca5642f3f3"},{url:"assets/third-party/font-awesome/css/brands.min.css",revision:"120cd1fc94476fc0d8df485f8f937e20"},{url:"assets/third-party/font-awesome/css/fontawesome.min.css",revision:"835b264d24ffdf8fe3800a61266fa76a"},{url:"assets/third-party/font-awesome/css/solid.min.css",revision:"7c68b1b1aad853b83d0c29a5eefc6eb5"},{url:"index.html",revision:"2fd495604f3f2ff5f4442fecaf533a29"},{url:"session-data-builder.html",revision:"186ad465389531bf37538df51a78c6a9"},{url:"text2lesson.js",revision:"c8d1f3eccc2b5500f4ac9e7c1a139cfc"}],{})}));
//# sourceMappingURL=sw.js.map
