if(!self.define){let s,e={};const a=(a,o)=>(a=new URL(a+".js",o).href,e[a]||new Promise((e=>{if("document"in self){const s=document.createElement("script");s.src=a,s.onload=e,document.head.appendChild(s)}else s=a,importScripts(a),e()})).then((()=>{let s=e[a];if(!s)throw new Error(`Module ${a} didn’t register its module`);return s})));self.define=(o,i)=>{const r=s||("document"in self?document.currentScript.src:"")||location.href;if(e[r])return;let t={};const d=s=>a(s,r),n={module:{uri:r},exports:t,require:d};e[r]=Promise.all(o.map((s=>n[s]||d(s)))).then((s=>(i(...s),t)))}}define(["./workbox-881147be"],(function(s){"use strict";s.setCacheNameDetails({prefix:"text2lesson"}),self.addEventListener("message",(s=>{s.data&&"SKIP_WAITING"===s.data.type&&self.skipWaiting()})),s.precacheAndRoute([{url:"assets/audio/bad1.mp3",revision:"9fc6ff14eae35a5d7bb2f31fea0aa863"},{url:"assets/audio/bad2.mp3",revision:"c1711e7fe814f0533a88c34b21b9038c"},{url:"assets/audio/blip1.mp3",revision:"badf1d1e48b41dd4d32b3cdee02e06c7"},{url:"assets/audio/good1.mp3",revision:"43c0cab578e71f7be3ee1a5baa557231"},{url:"assets/audio/good2.mp3",revision:"d01765720e1950b77a69fe4d5ec9ca73"},{url:"assets/fonts/STIXTwoMath-Regular.ttf",revision:"97f686351d834cd02f3dd677139e58bb"},{url:"assets/fonts/STIXTwoMath-Regular.woff2",revision:"cb418355a5de2f20d5db76cde276a6f8"},{url:"assets/i18n/en.json",revision:"522a0c8a024773a8a3f21eb20057738b"},{url:"assets/images/logo/bordered_logo_128.png",revision:"679b7659cdb937c244c3ce54afeddb16"},{url:"assets/images/logo/borderless_logo_128.png",revision:"212ffcb429e9e5dbd8c0574f10212b99"},{url:"assets/images/logo/borderless_logo_167.png",revision:"cabb9ad1cf0cc6358fcc4629a5309ce1"},{url:"assets/images/logo/borderless_logo_180.png",revision:"434ee054aab97b3cffa739d28ea14f84"},{url:"assets/images/logo/borderless_logo_192.png",revision:"c1d77630c45901fa8ee1a1f6ccd50835"},{url:"assets/images/logo/borderless_logo_48.png",revision:"2428973eff70a3433e618a19aef6ca36"},{url:"assets/images/logo/borderless_logo_512.png",revision:"789a9273a0b037057969837587416552"},{url:"assets/images/logo/Contents.json",revision:"3ea782a3be6a0385c5188d407bf7f5d5"},{url:"assets/images/logo/tiny_logo_16.png",revision:"3e9b01ef8e19f47c77492e9d88e45089"},{url:"assets/images/logo/tiny_logo_24.png",revision:"57306ed9a20e308fa49fdceebc31ac68"},{url:"assets/images/public-domain/gplv3-or-later.png",revision:"5aea1280bf3084ce062444cede3e385b"},{url:"assets/lessons/libraries.json",revision:"55710b927de3b9fc57d3a909fec79e1a"},{url:"assets/styles/candy.css",revision:"d63b834bd753328e5527ddc2a5f0d14d"},{url:"assets/styles/cards.css",revision:"d99b0a6ca0ee7d26dcb5e7314aeaf71b"},{url:"assets/styles/lessons.css",revision:"22ade0c729bb2a786ae9c6384baa86a8"},{url:"assets/styles/mathml.css",revision:"945832b2be079ebb363df6a4dc6aa9c5"},{url:"assets/styles/printable-lesson.css",revision:"662be2ee916adb6047882eecb54190f4"},{url:"assets/styles/style.css",revision:"1c9f694d6d9d4e52591e1bb75315bc98"},{url:"assets/styles/utils-controls.css",revision:"c9a71fd513b9a8cb0f0a6959623a48a7"},{url:"assets/styles/utils-dialogs.css",revision:"16d5d6da25150530a08b2fc24e6f8e87"},{url:"assets/styles/utils-icons.css",revision:"67e63078ed6c612551e8762739207e15"},{url:"assets/styles/utils-menu.css",revision:"274839f4eac3e63e96d590f32c2280da"},{url:"assets/styles/utils.css",revision:"8393759bcd2b4d179f44aaa40f48ee57"},{url:"assets/third-party/font-awesome/css/brands.min.css",revision:"120cd1fc94476fc0d8df485f8f937e20"},{url:"assets/third-party/font-awesome/css/fontawesome.min.css",revision:"835b264d24ffdf8fe3800a61266fa76a"},{url:"assets/third-party/font-awesome/css/solid.min.css",revision:"7c68b1b1aad853b83d0c29a5eefc6eb5"},{url:"assets/third-party/font-awesome/webfonts/fa-brands-400.ttf",revision:"0ab3921d9b80975c5597432ab59f5d0a"},{url:"assets/third-party/font-awesome/webfonts/fa-brands-400.woff2",revision:"8b0ddedbb27cbc9971c8667caa8a0cc1"},{url:"assets/third-party/font-awesome/webfonts/fa-solid-900.ttf",revision:"e2ceb83946c9e5fc7eab24453a03bffb"},{url:"assets/third-party/font-awesome/webfonts/fa-solid-900.woff2",revision:"c64278386c2bbb5e293e11b94ca2f6d1"},{url:"delete-everything-forever.html",revision:"ceb532af0c523633340d63445941c38f"},{url:"index.html",revision:"84632ad954f66bd1936d8ab71bf0b1c3"},{url:"languages.json",revision:"ecfd37f3e112b5c1fb4259fb6a46a950"},{url:"manifest.json",revision:"c50934b8f21d9062eb89db350cefdf1b"},{url:"text2lesson.js",revision:"d1520661dd10e40d5d9bb04744967572"}],{}),s.registerRoute(/^https:\/\/henspace\.github\.io\/text2lesson-library\/[-a-zA-Z0-9@:%_+.~#?/]+\.(?:json|txt)$/,new s.NetworkFirst({cacheName:"RapidQandALessonData",plugins:[new s.ExpirationPlugin({maxEntries:50})]}),"GET"),s.registerRoute(/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/[-a-zA-Z0-9@:%_+.~#?/]+\.(gif|png|jpg|jpeg|svg)$/,new s.NetworkFirst({cacheName:"RapidQandALessonMedia",plugins:[new s.ExpirationPlugin({maxEntries:50})]}),"GET")}));
//# sourceMappingURL=sw.js.map
