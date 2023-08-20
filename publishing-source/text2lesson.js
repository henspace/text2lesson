"use strict";

/**
 * text2lesson 1.0.5
 * Text2Lesson: create quizzes and lessons from plain text files.
 * Copyright 2023 Steve Butler (henspace.com)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 * 
 */
!function () {
  "use strict";

  const BuildInfo = {
      isBuilt: () => BuildInfo.getMode().indexOf("$") < 0,
      getBuildDate: () => "2023-08-20 13:46:32Z",
      getMode: () => "production",
      getVersion: () => "1.0.5 ",
      getBundleName: () => "text2lesson.js"
    },
    blockReps = [{
      re: /(?:(.+)\n=+\n)/g,
      rep: "\n\n<h1>$1</h1>\n\n"
    }, {
      re: /(?:(.+)\n-+\n)/g,
      rep: "\n\n<h2>$1</h2>\n\n"
    }, {
      re: /^(#+)(?: *)(.+?)(?:#*)[ \t]*$/gm,
      rep: (matched, hashes, txt) => {
        const level = Math.min(hashes.length, 6);
        return `\n\n<h${level}>${txt.trim()}</h${level}>\n`;
      }
    }, reAllLinesStartWith(">[ \t]*", {
      blockPrefix: "<blockquote>",
      blockSuffix: "</blockquote>"
    }), reAllLinesStartWith("(?: {4}|\t)", {
      blockPrefix: "<pre><code>",
      blockSuffix: "</code></pre>"
    }), {
      re: /^(?:[*_-] *){3,}\s*$/gm,
      rep: "\n\n<hr>\n\n"
    }, reAllLinesStartWith(" {0,3}[*+-][ \t]*", {
      blockPrefix: "<ul>",
      blockSuffix: "</ul>",
      linePrefix: "<li>",
      lineSuffix: "</li>"
    }), reAllLinesStartWith(" {0,3}\\d+\\.[ \t]*", {
      blockPrefix: "<ol>",
      blockSuffix: "</ol>",
      linePrefix: "<li>",
      lineSuffix: "</li>"
    }), {
      re: /(?:(?:^|\n{2,})(?!<\w+>))((?:.(?:\n(?!\n))?)+)/g,
      rep: "\n\n<p>$1</p>\n\n"
    }, {
      re: /\n{2,}/g,
      rep: "\n\n"
    }],
    spanReps = [{
      re: /!\[(.*)\]\((https?:\/\/[-\w@:%.+~#=/]+)(?: +"(.*)")?\)/gm,
      rep: '<img alt="$1" src="$2" title="$3"/>'
    }, {
      re: /\[(.*)\]\((https?:\/\/[-\w@:%.+~#=/]+)(?: +"(.*)")?\)/gm,
      rep: '<a target="_blank" href="$2" title="$3">$1</a>'
    }, {
      re: /(?:&lt;|<)(https?:\/\/[-\w@:%.+~#=/]+)>/gm,
      rep: '<a target="_blank" href="$1">$1</a>'
    }, {
      re: /(?:&lt;|<)(\w+(?:[.-]?\w+)*@\w+(?:[.-]?\w+)*(?:\.\w{2,4})+)>/gm,
      rep: (match, address) => {
        const encoded = function (data) {
          let result = "";
          for (const chr of data) result += encodeCharToEntity(chr);
          return result;
        }(address);
        return `<a href="${encoded}">${encoded}</a>`;
      }
    }, {
      re: /(?:`{2,}(.*?)`{2,}|`(.*?)`)/gm,
      rep: (match, codeA, codeB) => `<code>${codeA ?? codeB}</code>`
    }, {
      re: /\*\*([^\s])(.*?)([^\s])\*\*/gm,
      rep: "<strong>$1$2$3</strong>"
    }, {
      re: /__([^\s])(.*?)([^\s])__/gm,
      rep: "<strong>$1$2$3</strong>"
    }, {
      re: /\*([^\s])(.*?)([^\s])\*/gm,
      rep: "<em>$1$2$3</em>"
    }, {
      re: /_([^\s])(.*?)([^\s])_/gm,
      rep: "<em>$1$2$3</em>"
    }],
    markdownEscReps = [{
      re: /\\([\\`*_{}[\]()#+.!-])/g,
      rep: (match, chr) => encodeCharToEntity(chr)
    }],
    securityReps = [{
      re: "\0",
      rep: "�"
    }],
    htmlEscIgnoringBrReps = [{
      re: /&(?![\w#]+?;)/gm,
      rep: "&amp;"
    }, {
      re: /<(?!br>)/gim,
      rep: "&lt;"
    }],
    htmlEscAllReps = [{
      re: /&(?![\w#]+?;)/gm,
      rep: "&amp;"
    }, {
      re: /</gim,
      rep: "&lt;"
    }],
    htmlCleanUpReps = [{
      re: /^\s*$/gm,
      rep: ""
    }, {
      re: /<(?:p|div)>\s*?<\/(?:p|div)>/gim,
      rep: ""
    }];
  function processReplacements(data, replacements) {
    return data ? (replacements.forEach(sub => {
      data = data.replaceAll(sub.re, sub.rep);
    }), data) : data;
  }
  function reAllLinesStartWith(reStart, options) {
    const reBlockSearchRe = new RegExp(`(?:^|\\n)${reStart}(?:.|\\n)*?(?:(\\n(?!${reStart}))|$)`, "g"),
      lineReplacementRe = new RegExp(`^${reStart}(\\s*.*)$`, "gm"),
      lineReplacement = `${options?.linePrefix ?? ""}$1${options?.lineSuffix ?? ""}`;
    return {
      re: reBlockSearchRe,
      rep: match => `\n\n${options?.blockPrefix ?? ""}${match.replaceAll(lineReplacementRe, lineReplacement)}${options?.blockSuffix ?? ""}\n\n`
    };
  }
  function encodeCharToEntity(chr) {
    return `&#${chr.charCodeAt(0).toString()};`;
  }
  function parseMarkdown(data, options) {
    var result = data.replaceAll(/\r/g, "");
    return result = processReplacements(result, securityReps), options?.pre && (result = processReplacements(result, options.pre)), result = processReplacements(result, htmlEscIgnoringBrReps), result = processReplacements(result, markdownEscReps), result = processReplacements(result, blockReps), result = processReplacements(result, spanReps), result = processReplacements(result, htmlCleanUpReps), options?.post && (result = processReplacements(result, options.post)), result;
  }
  function escapeHtml(data) {
    return data = processReplacements(data, securityReps), processReplacements(data, htmlEscAllReps);
  }
  function getPlainTextFromHtml(html) {
    return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ");
  }
  let activeTranslations = null,
    fallbackTranslations = null;
  function setActiveTranslations(translations) {
    !function (translations) {
      for (const key in translations) translations[key] = escapeHtml(translations[key]);
    }(translations), activeTranslations && (fallbackTranslations = activeTranslations), activeTranslations = translations;
  }
  function i18n(strings) {
    const keyMatch = strings[0].match(/(\w+?)::(.*)/);
    let keyword = "",
      result = [];
    keyMatch ? (keyword = keyMatch[1], result.push(keyMatch[2])) : result.push(strings[0]);
    let output,
      template = activeTranslations ? activeTranslations[keyword] : null;
    for (var _len = arguments.length, values = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      values[_key - 1] = arguments[_key];
    }
    return template || (template = fallbackTranslations ? fallbackTranslations[keyword] : null), template ? output = function (template, values) {
      let defaultIndex = 0;
      return template.replace(/\${(.*?)}/g, (match, index) => (index = parseInt(index), isNaN(index) && (index = defaultIndex++), index < values.length ? values[index] : (console.error(`Cannot find {${index}} for "${template}"`), "${?}")));
    }(template, values) : (values.forEach((value, i) => {
      result.push(value), result.push(strings[i + 1]);
    }), output = result.join("")), output;
  }
  function extractLanguageSubTags(languageTag) {
    var language = "",
      extlang = "",
      script = "",
      region = "";
    const matches = (languageTag = languageTag.toLowerCase()).match(/^([a-z]{2,3})(-[a-z]{3}(?:-[a-z]{3}){0,2})?(-[a-z]{4})?(-(?:[a-z]{2}|[0-9]{3}))?([-].{5,})?$/);
    return matches && (language = matches[1], extlang = matches[2] ? matches[2].substring(1) : "", script = matches[3] ? matches[3].substring(1) : "", region = matches[4] ? matches[4].substring(1) : ""), {
      language: language,
      extlang: extlang,
      script: script,
      region: region
    };
  }
  function RGB(red, green, blue) {
    this.red = red, this.green = green, this.blue = blue;
  }
  function HSL(hue, saturation, luminance) {
    this.hue = hue, this.saturation = saturation, this.luminance = luminance;
  }
  function relativeLuminance(rgbColor) {
    const RsRGB = rgbColor.red / 255,
      GsRGB = rgbColor.green / 255,
      BsRGB = rgbColor.blue / 255;
    return 100 * (.2126 * (RsRGB <= .03928 ? RsRGB / 12.92 : ((RsRGB + .055) / 1.055) ** 2.4) + .7152 * (GsRGB <= .03928 ? GsRGB / 12.92 : ((GsRGB + .055) / 1.055) ** 2.4) + .0722 * (BsRGB <= .03928 ? BsRGB / 12.92 : ((BsRGB + .055) / 1.055) ** 2.4));
  }
  function isDark(rgbColor) {
    return relativeLuminance(rgbColor) < 50;
  }
  function rgbToHsl(rgbValue) {
    const RsRGB = rgbValue.red / 255,
      GsRGB = rgbValue.green / 255,
      BsRGB = rgbValue.blue / 255,
      minChannelValue = Math.min(RsRGB, GsRGB, BsRGB),
      maxChannelValue = Math.max(RsRGB, GsRGB, BsRGB),
      channelRange = maxChannelValue - minChannelValue,
      luminance = (minChannelValue + maxChannelValue) / 2;
    if (Math.abs(channelRange) < .001) return {
      hue: 0,
      saturation: 0,
      luminance: Math.round(100 * luminance)
    };
    let saturation = 0;
    saturation = luminance <= .5 ? channelRange / (minChannelValue + maxChannelValue) : channelRange / (2 - maxChannelValue - minChannelValue);
    let hue = 0;
    return 0 !== channelRange && (hue = Math.abs(maxChannelValue - RsRGB) < .001 ? (GsRGB - BsRGB) / channelRange : Math.abs(maxChannelValue - GsRGB) < .001 ? 2 + (BsRGB - RsRGB) / channelRange : 4 + (RsRGB - GsRGB) / channelRange), hue *= 60, hue < 0 && (hue += 360), {
      hue: Math.round(hue),
      saturation: Math.round(100 * saturation),
      luminance: Math.round(100 * luminance)
    };
  }
  function hslToRgb(hslValue) {
    const S = hslValue.saturation / 100,
      L = hslValue.luminance / 100,
      C = (1 - Math.abs(2 * L - 1)) * S,
      Htick = hslValue.hue / 60,
      X = C * (1 - Math.abs(Htick % 2 - 1));
    let RGBtick = {};
    RGBtick = 0 <= Htick && Htick < 1 ? {
      red: C,
      green: X,
      blue: 0
    } : Htick < 2 ? {
      red: X,
      green: C,
      blue: 0
    } : Htick < 3 ? {
      red: 0,
      green: C,
      blue: X
    } : Htick < 4 ? {
      red: 0,
      green: X,
      blue: C
    } : Htick < 5 ? {
      red: X,
      green: 0,
      blue: C
    } : {
      red: C,
      green: 0,
      blue: X
    };
    const m = L - C / 2;
    return new RGB(Math.round(255 * (RGBtick.red + m)), Math.round(255 * (RGBtick.green + m)), Math.round(255 * (RGBtick.blue + m)));
  }
  function getDarker(rgbColor, delta) {
    const hslColor = rgbToHsl(rgbColor);
    return hslColor.luminance -= delta, hslColor.luminance = Math.max(hslColor.luminance, 0), hslToRgb(hslColor);
  }
  function getLighter(rgbColor, delta) {
    const hslColor = rgbToHsl(rgbColor);
    return hslColor.luminance += delta, hslColor.luminance = Math.min(hslColor.luminance, 100), hslToRgb(hslColor);
  }
  function getContrast$1(rgbColorA, rgbColorB) {
    const contrast = (relativeLuminance(rgbColorA) / 100 + .05) / (relativeLuminance(rgbColorB) / 100 + .05);
    return contrast < 1 ? 1 / contrast : contrast;
  }
  function shiftHue(rgbValue, degrees) {
    const hsl = rgbToHsl(rgbValue);
    return hsl.hue, hsl.hue += degrees, hsl.hue %= 360, hsl.hue < 0 && (hsl.hue += 360), hslToRgb(hsl);
  }
  const root = document.querySelector(":root");
  function setProperty(propertyName, propertyValue) {
    root.style.setProperty(propertyName, propertyValue);
  }
  function PaletteEntry(base, contrast, highlight) {
    this.base = base, this.contrast = contrast, this.highlight = highlight;
  }
  function Palette(config) {
    this.primary = config.primary, this.secondary = config.secondary, this.tertiary = config.tertiary, this.background = config.background, this.window = config.window, this.error = config.error;
  }
  function getPaletteEntry(rgbColor) {
    let highlight;
    highlight = isDark(rgbColor) ? getLighter(rgbColor, 10) : getDarker(rgbColor, 10);
    const contrastColor = function (rgbColor) {
      return isDark(rgbColor) ? {
        red: 255,
        green: 255,
        blue: 255
      } : {
        red: 0,
        green: 0,
        blue: 0
      };
    }(rgbColor);
    return new PaletteEntry(rgbColor = function (rgbColor, rgbColorReference, minContrast) {
      const refIsDark = isDark(rgbColorReference);
      let loopLimit = Math.floor(20);
      for (; loopLimit-- && getContrast$1(rgbColor, rgbColorReference) < minContrast;) rgbColor = refIsDark ? getLighter(rgbColor, 5) : getDarker(rgbColor, 5);
      return rgbColor;
    }(rgbColor, contrastColor, 7.5), contrastColor, highlight);
  }
  function setCssFromPaletteEntry(key, paletteEntry) {
    for (const subkey in paletteEntry) relativeLuminance(paletteEntry.base), relativeLuminance(paletteEntry.contrast), setProperty(`--${key}-${subkey}`, `rgb(${(rgbColor = paletteEntry[subkey]).red}, ${rgbColor.green}, ${rgbColor.blue})`);
    var rgbColor;
  }
  function fetchJson(url) {
    return fetchFile(url, "json");
  }
  function fetchFile(url, responseType) {
    return console.debug(`Fetch ${url}`), fetch(url).then(response => response.ok ? "json" === responseType.toLocaleLowerCase() ? response.json() : response.text() : Promise.reject(new Error(`${response.status}: ${response.statusText}; ${url}`)));
  }
  class CachedLesson {
    #info;
    #content;
    constructor(info, content) {
      this.#info = info, this.#content = content;
    }
    set content(content) {
      this.#content = content;
    }
    get content() {
      return this.#content;
    }
    get info() {
      return this.#info;
    }
    static clone(other) {
      const cloned = new CachedLesson(null);
      return cloned.#info = {
        ...other.info
      }, cloned.#content = other.content, cloned;
    }
  }
  const persistentData = new class DataStoreManager {
      #storage;
      #keyPrefix = "app";
      constructor(storage) {
        this.#storage = storage;
      }
      createStorageKey(key) {
        return `${this.#keyPrefix}${key}`;
      }
      getFromStorage(key, defaultValue) {
        key = this.createStorageKey(key);
        const value = this.#storage.getItem(key);
        if (value) try {
          const parsedValue = JSON.parse(value);
          return null == parsedValue ? defaultValue : parsedValue;
        } catch (error) {
          console.error(error);
        }
        return defaultValue;
      }
      saveToStorage(key, value) {
        key = this.createStorageKey(key), this.#storage.setItem(key, JSON.stringify(value));
      }
      setStorageKeyPrefix(prefix) {
        this.#keyPrefix = prefix;
      }
    }(localStorage),
    rootUrl = window.location.href.replace(/index\.html(\?.*)?$/, ""),
    Urls = {
      HELP: `${rootUrl}assets/docs/help.md`,
      PRIVACY: `${rootUrl}assets/docs/privacy.md`
    };
  class LocalLibrary {
    static LOCAL_LIBRARY_KEY = "LOCAL_LIBRARY";
    static NUMBER_OF_LESSONS = 4;
    #key;
    #title;
    #contentLoader;
    constructor() {
      this.#key = LocalLibrary.LOCAL_LIBRARY_KEY, this.#title = i18n`72393b3cb338d9556ecd072e26907479::`, this.#contentLoader = () => this.#getLibraryContent();
    }
    get key() {
      return this.#key;
    }
    get info() {
      return {
        title: this.#title,
        contentLoader: this.#contentLoader
      };
    }
    #getLibraryContent() {
      const book = {
        title: i18n`c025e43a825a053fc668cef35cfa9ef5::`,
        location: "",
        chapters: [{
          title: i18n`8fe1f2e455ff223c81a6441733982773::`,
          lessons: []
        }]
      };
      for (let index = 0; index < LocalLibrary.NUMBER_OF_LESSONS; index++) {
        const localLesson = this.#loadLocalLesson(index);
        book.chapters[0].lessons.push({
          title: localLesson.title,
          contentLoader: () => localLesson.content
        });
      }
      return [book];
    }
    #getStorageKeyForIndex(index) {
      return `LocalLesson_${index}`;
    }
    #loadLocalLesson(index) {
      const defaultLesson = {
        title: i18n`8be68ffef1e55ad62df2b4a4dd222411::${index}`,
        content: i18n`0c61e973e1e23347be794197b57f91ab::${`[How to write lessons](${Urls.HELP})`}`
      };
      return persistentData.getFromStorage(this.#getStorageKeyForIndex(index), defaultLesson);
    }
    saveLocalLesson(index, localLesson) {
      persistentData.saveToStorage(this.#getStorageKeyForIndex(index), localLesson);
    }
  }
  const LessonOrigin_REMOTE = "remote",
    LessonOrigin_LOCAL = "local",
    LessonOrigin_SESSION = "session",
    LessonOrigin_FILE_SYSTEM = "file_system";
  const lessonManager = new class LessonManager {
      #usingLocalLibrary = !1;
      #libraries = new Map();
      #remoteLibraryKey;
      #currentLibraryKey;
      #currentBookIndex = 0;
      #currentChapterIndex = 0;
      #currentLessonIndex = 0;
      #cachedLesson;
      constructor() {}
      set remoteLibraryKey(key) {
        if (!this.#libraries.has(key)) return console.error(`Ignored attempt to set remote invalid remote library key ${key}.`), void (this.#usingLocalLibrary = !0);
        this.#remoteLibraryKey = key, this.#usingLocalLibrary || (this.#currentLibraryKey = this.#remoteLibraryKey);
      }
      set usingLocalLibrary(value) {
        this.#usingLocalLibrary = value, this.#currentLibraryKey = this.#usingLocalLibrary ? LocalLibrary.LOCAL_LIBRARY_KEY : this.#remoteLibraryKey;
      }
      get usingLocalLibrary() {
        return this.#usingLocalLibrary;
      }
      set bookIndex(index) {
        this.#libraries.get(this.#currentLibraryKey) ? this.#currentBookIndex = this.#ensurePositiveInt(index) : this.#currentBookIndex = 0;
      }
      set chapterIndex(index) {
        this.#currentChapterIndex = this.#ensurePositiveInt(index);
      }
      set lessonIndex(index) {
        this.#currentLessonIndex = this.#ensurePositiveInt(index);
      }
      get libraryTitle() {
        const title = this.#libraries.get(this.#currentLibraryKey)?.title;
        return title ?? "";
      }
      get libraryTitles() {
        const options = new Map();
        return this.#libraries.forEach((value, key) => {
          options.set(key, value.title);
        }), options;
      }
      get remoteLibraryTitles() {
        const options = new Map();
        return this.#libraries.forEach((value, key) => {
          key !== LocalLibrary.LOCAL_LIBRARY_KEY && options.set(key, value.title);
        }), options;
      }
      get bookTitle() {
        const title = this.#getCurrentBook()?.title;
        return title ?? "";
      }
      get bookTitles() {
        const titles = [];
        return this.#libraries.get(this.#currentLibraryKey)?.books.forEach(value => {
          titles.push(value.title);
        }), titles;
      }
      get chapterTitle() {
        const title = this.#getCurrentBook()?.chapters[this.#currentChapterIndex]?.title;
        return title ?? "";
      }
      get chapterTitles() {
        const titles = [];
        return this.#getCurrentBook().chapters.forEach(value => {
          titles.push(value.title);
        }), titles;
      }
      get lessonTitle() {
        const title = this.#getCurrentBook()?.chapters[this.#currentChapterIndex]?.lessons[this.#currentLessonIndex]?.title;
        return title ?? "";
      }
      get lessonTitles() {
        const titles = [];
        return this.#getCurrentBook().chapters[this.#currentChapterIndex].lessons.forEach(value => {
          titles.push(value.title);
        }), titles;
      }
      get currentLessonInfo() {
        return this.#buildCurrentLessonInfo();
      }
      getUnmanagedLessonInfo(lessonTitle, origin) {
        return {
          origin: origin,
          usingLocalLibrary: !1,
          libraryKey: void 0,
          file: void 0,
          url: void 0,
          indexes: {
            book: 0,
            chapter: 0,
            lesson: 0
          },
          titles: {
            library: "",
            book: "",
            chapter: "",
            lesson: lessonTitle
          }
        };
      }
      #buildCurrentLessonInfo(url) {
        this.#ensureIndexesValid();
        const book = this.#getCurrentBook();
        return {
          origin: this.#usingLocalLibrary ? LessonOrigin_LOCAL : LessonOrigin_REMOTE,
          usingLocalLibrary: this.#usingLocalLibrary,
          libraryKey: this.#currentLibraryKey,
          file: book?.chapters[this.#currentChapterIndex]?.lessons[this.#currentLessonIndex]?.file,
          url: url,
          indexes: {
            book: this.#currentBookIndex,
            chapter: this.#currentChapterIndex,
            lesson: this.#currentLessonIndex
          },
          titles: {
            library: this.#libraries.get(this.#currentLibraryKey)?.title,
            book: book?.title,
            chapter: book?.chapters[this.#currentChapterIndex]?.title,
            lesson: book?.chapters[this.#currentChapterIndex]?.lessons[this.#currentLessonIndex]?.title
          }
        };
      }
      formUrlForLesson() {
        const books = this.#libraries.get(this.#currentLibraryKey).books;
        return `${books[this.#currentBookIndex].location}${books[this.#currentBookIndex].chapters[this.#currentChapterIndex].lessons[this.#currentLessonIndex].file}`;
      }
      #ensurePositiveInt(index) {
        return index = parseInt(index), isNaN(index) || index < 0 ? 0 : index;
      }
      #ensureIndexesValid() {
        const library = this.#libraries.get(this.#currentLibraryKey);
        this.#indexInvalid(this.#currentBookIndex, library?.books) && (this.#currentBookIndex = 0);
        const book = library?.books[this.#currentBookIndex];
        this.#indexInvalid(this.#currentChapterIndex, book?.chapters) && (this.#currentChapterIndex = 0);
        const chapter = book?.chapters[this.#currentChapterIndex];
        this.#indexInvalid(this.#currentLessonIndex, chapter?.lessons.length) && (this.#currentLessonIndex = 0);
      }
      #indexInvalid(index, arrayData) {
        return null != arrayData && (isNaN(index) || index < 0 || index >= arrayData.length);
      }
      #getCurrentBook() {
        return this.#libraries.get(this.#currentLibraryKey).books[this.#currentBookIndex];
      }
      loadAllLibraries(librariesFileLocation) {
        this.#libraries = new Map();
        const localLibrary = new LocalLibrary();
        return this.#libraries.set(localLibrary.key, localLibrary.info), fetchJson(librariesFileLocation).then(entries => {
          for (const key in entries) {
            const entry = entries[key];
            entry.title = escapeHtml(entry.title), this.#libraries.set(key, entries[key]), this.#libraries.get(key).books = [];
          }
          return this.#libraries.size;
        });
      }
      loadAllLibraryContent() {
        return this.#loadLibraryContent(LocalLibrary.LOCAL_LIBRARY_KEY).then(() => this.#loadLibraryContent(this.#remoteLibraryKey));
      }
      #loadLibraryContent(key, force) {
        const library = this.#libraries.get(key);
        return library.books?.length > 0 && !force ? Promise.resolve() : library.contentLoader ? (library.books = library.contentLoader(), this.#escapeAllTitles(library.books), this.#ensureIndexesValid(), Promise.resolve()) : fetchJson(library.url).then(value => {
          library.books = value, this.#escapeAllTitles(library.books), this.#ensureIndexesValid();
        });
      }
      #escapeAllTitles(books) {
        books.forEach(book => {
          book.title = escapeHtml(book.title), book.chapters.forEach(chapter => {
            chapter.title = escapeHtml(chapter.title), chapter.lessons.forEach(lesson => {
              lesson.title = escapeHtml(lesson.title);
            });
          });
        });
      }
      loadCurrentLesson() {
        this.#ensureIndexesValid();
        const contentLoader = this.#getCurrentBook().chapters[this.#currentChapterIndex].lessons[this.#currentLessonIndex].contentLoader;
        return contentLoader ? this.#loadLessonUsingContentLoader(contentLoader) : this.#loadRemoteLesson();
      }
      #loadLessonUsingContentLoader(contentLoader) {
        return Promise.resolve(new CachedLesson(this.#buildCurrentLessonInfo(""), contentLoader()));
      }
      #loadRemoteLesson() {
        const url = this.formUrlForLesson();
        return this.#cachedLesson?.info.url === url ? (console.info(`Using cached version of lesson: ${url}`), Promise.resolve(CachedLesson.clone(this.#cachedLesson))) : (this.#cachedLesson = new CachedLesson(this.#buildCurrentLessonInfo(url)), function (url) {
          return fetchFile(url, "text");
        }(url).then(text => (console.info(`Loaded lesson: ${url}`), this.#cachedLesson.content = text, CachedLesson.clone(this.#cachedLesson))));
      }
      updateCurrentLessonContent(title, content) {
        if (!this.#usingLocalLibrary) throw new Error("Attempt made to update a remote library.");
        return new LocalLibrary().saveLocalLesson(this.#currentLessonIndex, {
          title: title,
          content: content
        }), this.#loadLibraryContent(LocalLibrary.LOCAL_LIBRARY_KEY, !0);
      }
    }(),
    DEFAULT_HUE = 120,
    DEFAULT_SATURATION = 50,
    DEFAULT_COLOR_SPREAD = 120,
    DEFAULT_DARK_MODE = !1;
  function setPalette(settings) {
    settings.hue = settings.hue ?? persistentData.getFromStorage("hue", DEFAULT_HUE), settings.saturation = settings.saturation ?? persistentData.getFromStorage("saturation", DEFAULT_SATURATION), settings.spread = settings.spread ?? persistentData.getFromStorage("spread", DEFAULT_COLOR_SPREAD), settings.dark = settings.dark ?? persistentData.getFromStorage("darkMode", DEFAULT_DARK_MODE), function (palette) {
      for (const entryKey in palette) setCssFromPaletteEntry(entryKey, palette[entryKey]);
    }(function (settings) {
      const primaryRgb = hslToRgb(new HSL(settings.hue, settings.saturation, settings.dark ? 70 : 30)),
        colors = [primaryRgb];
      let complementA = shiftHue(primaryRgb, settings.spread),
        complementB = shiftHue(primaryRgb, -settings.spread);
      colors.push(complementA, complementB), colors.sort((a, b) => {
        const relLuminanceA = relativeLuminance(a),
          relLuminanceB = relativeLuminance(b);
        return relLuminanceA > relLuminanceB ? 1 : relLuminanceA < relLuminanceB ? -1 : 0;
      }), colors[0] = getDarker(colors[0], 5), colors[2] = getLighter(colors[0], 5);
      const errorHsl = new HSL(0, settings.saturation, 50),
        backgroundHsl = new HSL(settings.hue, 0, settings.dark ? 5 : 95),
        windowHsl = new HSL(settings.hue, 0, settings.dark ? 0 : 100);
      return new Palette({
        primary: getPaletteEntry(primaryRgb),
        secondary: getPaletteEntry(complementA),
        tertiary: getPaletteEntry(complementB),
        background: getPaletteEntry(hslToRgb(backgroundHsl)),
        window: getPaletteEntry(hslToRgb(windowHsl)),
        error: getPaletteEntry(hslToRgb(errorHsl))
      });
    }(settings));
  }
  function stringToBase64(str) {
    return window.btoa(encodeURIComponent(str));
  }
  function base64ToString(base64) {
    return decodeURIComponent(window.atob(base64));
  }
  class ManagedElement {
    #element;
    #listeningTargets;
    #managedChildren;
    #elementRemovable;
    constructor(tagOrElement, className) {
      tagOrElement instanceof Element ? (this.#element = tagOrElement, this.#elementRemovable = !1) : (this.#element = document.createElement(tagOrElement), this.#elementRemovable = !0), className && (this.#element.className = className), this.#listeningTargets = [], this.#managedChildren = [];
    }
    static getElement(item) {
      return item instanceof ManagedElement ? item.element : item;
    }
    static $(item) {
      return item instanceof ManagedElement ? item.element : item;
    }
    get element() {
      return this.#element;
    }
    get $() {
      return this.#element;
    }
    get disabled() {
      return this.#element.disabled;
    }
    set disabled(value) {
      this.#element.disabled = value;
    }
    get id() {
      return this.#element.id;
    }
    set id(value) {
      this.#element.id = value;
    }
    get managedChildren() {
      return this.#managedChildren;
    }
    get classList() {
      return this.#element.classList;
    }
    get className() {
      return this.#element.className;
    }
    set className(value) {
      this.#element.className = value;
    }
    get checked() {
      return this.#element.checked;
    }
    set checked(state) {
      this.#element.checked = state;
    }
    get children() {
      return this.#element.children;
    }
    get innerHTML() {
      return this.#element.innerHTML;
    }
    set innerHTML(data) {
      this.#element.innerHTML = data;
    }
    get lastElementChild() {
      return this.#element.lastElementChild;
    }
    get offsetHeight() {
      return this.#element.offsetHeight;
    }
    get offsetWidth() {
      return this.#element.offsetWidth;
    }
    get parentElement() {
      return this.#element.parentElement;
    }
    get style() {
      return this.#element.style;
    }
    get tagName() {
      return this.#element.tagName;
    }
    get textContent() {
      return this.#element.textContent;
    }
    set textContent(data) {
      this.#element.textContent = data;
    }
    get value() {
      return this.#element.value;
    }
    set value(data) {
      this.#element.value = data;
    }
    appendChild(managedElement) {
      return this.#element.appendChild(managedElement.element), this.#managedChildren.push(managedElement), managedElement;
    }
    appendChildTo(managedElement, parent) {
      parent.appendChild(managedElement.element ?? managedElement), this.#managedChildren.push(managedElement);
    }
    appendTo(parent) {
      parent.appendChild(this.#element);
    }
    createAndAppendChild(tagName, cssClass, html) {
      const managedElement = new ManagedElement(tagName);
      return cssClass && managedElement.classList.add(cssClass), html && (managedElement.innerHTML = html), this.appendChild(managedElement), managedElement;
    }
    static decodeString(value) {
      return base64ToString(value);
    }
    static encodeString(value) {
      return stringToBase64(value);
    }
    dispatchEvent(event) {
      return this.#element.dispatchEvent(event);
    }
    fadeOut() {
      this.#element.classList.remove("fade-in"), this.#element.classList.add("fade-out");
    }
    fadeIn() {
      this.#element.classList.remove("fade-out"), this.#element.classList.add("fade-in");
    }
    focus() {
      this.#element.focus();
    }
    getBoundingClientRect() {
      return this.#element.getBoundingClientRect();
    }
    static getSafeAttribute(element, name) {
      return ManagedElement.decodeString(element.getAttribute(name));
    }
    handleEvent(event) {
      console.debug(`Event ${event.type} fired on <${event.currentTarget.tagName}>: class ${event.target.className}.`);
      const handlerName = "handle" + event.type.charAt(0).toUpperCase() + event.type.substring(1) + "Event",
        eventId = event.currentTarget.getAttribute("data-event-id");
      this[handlerName]?.(event, eventId);
    }
    hide() {
      this.#element.style.display = "none";
    }
    insertChildAtTop(managedElement) {
      return this.#element.insertBefore(managedElement.element ?? managedElement, this.#element.firstChild), this.#managedChildren.push(managedElement), managedElement;
    }
    listenToOwnEvent(eventType, eventIdOrHandler) {
      this.listenToEventOn(eventType, this, eventIdOrHandler);
    }
    listenToEventOn(eventType, target, eventIdOrHandler) {
      if (!(target instanceof ManagedElement)) throw new Error("Expect ManagedElement");
      this.#listeningTargets.push({
        managedElement: target,
        eventType: eventType
      }), eventIdOrHandler instanceof Function ? target.$.addEventListener(eventType, eventIdOrHandler) : (null != eventIdOrHandler && target.setAttribute("data-event-id", eventIdOrHandler), target.$.addEventListener(eventType, this));
    }
    querySelector(selectors) {
      return this.#element.querySelector(selectors);
    }
    querySelectorAll(selectors) {
      return this.#element.querySelectorAll(selectors);
    }
    remove() {
      this.removeListeners(), this.removeChildren(), this.#elementRemovable && this.#element.remove();
    }
    removeChildren() {
      this.#managedChildren.forEach(child => {
        child.remove();
      }), this.#managedChildren = [], this.#element.replaceChildren();
    }
    removeListeners() {
      this.#listeningTargets.forEach(target => {
        target.managedElement.element.removeEventListener(target.eventType, this);
      }), this.#managedChildren.forEach(child => {
        child.removeListeners();
      }), this.#listeningTargets = [];
    }
    setSafeAttribute(name, value) {
      this.#element.setAttribute(name, ManagedElement.encodeString(value));
    }
    setAttribute(name, value) {
      return this.#element.setAttribute(name, value);
    }
    show() {
      this.#element.style.display = "unset";
    }
    getSafeAttribute(name) {
      return ManagedElement.decodeString(this.#element.getAttribute(name));
    }
    setAttributes(attributes) {
      for (const key in attributes) {
        const value = attributes[key];
        null != value && null != value && "" !== value && this.#element.setAttribute(key, value);
      }
    }
  }
  const HTML_SEMANTIC_ROLES = {
    A: "link",
    BUTTON: "button"
  };
  const icons = new class IconGenerator {
    #cache = new Map();
    #getIconHtml(key) {
      if (!this.#cache.has(key)) {
        const cssValue = getComputedStyle(document.documentElement).getPropertyValue(key);
        this.#cache.set(key, cssValue.substring(1, cssValue.length - 1));
      }
      return this.#cache.get(key) ?? "!?";
    }
    get back() {
      return {
        content: this.#getIconHtml("--icon-back-nav-html"),
        accessibleName: i18n`0557fa923dcee4d0f86b1409f5c2167f::`
      };
    }
    get cancel() {
      return {
        content: this.#getIconHtml("--icon-cancel-html"),
        accessibleName: i18n`ea4788705e6873b424c65e91c2846b19::`
      };
    }
    get closeEditor() {
      return {
        content: this.#getIconHtml("--icon-close-editor-html"),
        accessibleName: i18n`218ed7e6bf7ff30555652c87feff7cd7::`
      };
    }
    get closeMenu() {
      return {
        content: this.#getIconHtml("--icon-close-menu-html"),
        accessibleName: i18n`68f18f6b55f955ad05e4a174341bf3f1::`
      };
    }
    get edit() {
      return {
        content: this.#getIconHtml("--icon-edit-html"),
        accessibleName: i18n`7dce122004969d56ae2e0245cb754d35::`
      };
    }
    get error() {
      return {
        content: this.#getIconHtml("--icon-error-html"),
        accessibleName: i18n`64d2cc43035360eddf790efbef5ddb30::`
      };
    }
    get exit() {
      return {
        content: this.#getIconHtml("--icon-exit-html"),
        accessibleName: i18n`cfce38c3725a96fb69d437d1f6af351c::`
      };
    }
    get export() {
      return {
        content: this.#getIconHtml("--icon-export-html"),
        accessibleName: i18n`3a7ff7e7931df81408c4e1465364c699::`
      };
    }
    get exportAutoRun() {
      return {
        content: this.#getIconHtml("--icon-export-autorun-html"),
        accessibleName: i18n`65b03512ff197b6b8899ba755db630f9::`
      };
    }
    get fatal() {
      return {
        content: this.#getIconHtml("--icon-fatal-html"),
        accessibleName: i18n`64d2cc43035360eddf790efbef5ddb30::`
      };
    }
    get flag() {
      return {
        content: this.#getIconHtml("--icon-flagged-html"),
        accessibleName: i18n`c5836008c1649301e29351a55db8f65c::`
      };
    }
    get openFolder() {
      return {
        content: this.#getIconHtml("--icon-open-folder-html"),
        accessibleName: i18n`a6e75eb31dc77e8d077fb6f92909e191::`
      };
    }
    get forward() {
      return {
        content: this.#getIconHtml("--icon-forward-nav-html"),
        accessibleName: i18n`67d2f6740a8eaebf4d5c6f79be8da481::`
      };
    }
    get help() {
      return {
        content: this.#getIconHtml("--icon-help-html"),
        accessibleName: i18n`6a26f548831e6a8c26bfbbd9f6ec61e0::`
      };
    }
    get home() {
      return {
        content: this.#getIconHtml("--icon-home-html"),
        accessibleName: i18n`8cf04a9734132302f96da8e113e80ce5::`
      };
    }
    get import() {
      return {
        content: this.#getIconHtml("--icon-import-html"),
        accessibleName: i18n`28dd16bcceda4431550c96dfc257dd22::`
      };
    }
    get info() {
      return {
        content: this.#getIconHtml("--icon-info-html"),
        accessibleName: i18n`c5836008c1649301e29351a55db8f65c::`
      };
    }
    get selectLesson() {
      return {
        content: this.#getIconHtml("--icon-lesson-html"),
        accessibleName: i18n`666258634f2ea689eac1e01b184a3cea::`
      };
    }
    get library() {
      return {
        content: this.#getIconHtml("--icon-library-html"),
        accessibleName: i18n`d6e5c296474cad126efdfa515a47f1f8::`
      };
    }
    get load() {
      return {
        content: this.#getIconHtml("--icon-load-html"),
        accessibleName: i18n`74540c79e377bea903e1023a46df5574::`
      };
    }
    get nextProblem() {
      return {
        content: this.#getIconHtml("--icon-next-problem-html"),
        accessibleName: i18n`a0bfb8e59e6c13fc8d990781f77694fe::`
      };
    }
    get no() {
      return {
        content: this.#getIconHtml("--icon-no-html"),
        accessibleName: i18n`bafd7322c6e97d25b6299b5d6fe8920b::`
      };
    }
    get ok() {
      return {
        content: this.#getIconHtml("--icon-ok-html"),
        accessibleName: i18n`e0aa021e21dddbd6d8cecec71e9cf564::`
      };
    }
    get pause() {
      return {
        content: this.#getIconHtml("--icon-pause-html"),
        accessibleName: i18n`105b296a83f9c105355403f3332af50f::`
      };
    }
    get play() {
      return {
        content: this.#getIconHtml("--icon-play-html"),
        accessibleName: i18n`de3c731be5633838089a07179d301d7b::`
      };
    }
    get playLesson() {
      return {
        content: this.#getIconHtml("--icon-play-html"),
        accessibleName: i18n`afd061e2316f7ab6f934ef5b43f994b6::`
      };
    }
    get privacy() {
      return {
        content: this.#getIconHtml("--icon-privacy-html"),
        accessibleName: i18n`c5f29bb36f9158d2e00f5d4dc213a0ff::`
      };
    }
    get question() {
      return {
        content: this.#getIconHtml("--icon-question-html"),
        accessibleName: i18n`c5836008c1649301e29351a55db8f65c::`
      };
    }
    get repeatLesson() {
      return {
        content: this.#getIconHtml("--icon-repeat-lesson-html"),
        accessibleName: i18n`87a0a633db4ae5246df7ebf3e417a805::`
      };
    }
    get resetToFactory() {
      return {
        content: this.#getIconHtml("--icon-reset-to-factory-html"),
        accessibleName: i18n`5dcd7aaf263cdf5f7d1de6aa2264e29f::`
      };
    }
    get save() {
      return {
        content: this.#getIconHtml("--icon-save-html"),
        accessibleName: i18n`35d29613e7c8ecabf12dfa188ab862f8::`
      };
    }
    get settings() {
      return {
        content: this.#getIconHtml("--icon-settings-html"),
        accessibleName: i18n`f4f70727dc34561dfde1a3c529b6205c::`
      };
    }
    get skip() {
      return {
        content: this.#getIconHtml("--icon-skip-html"),
        accessibleName: i18n`72ef2b9b6965d078e3c7f95487a82d1c::`
      };
    }
    get submitAnswer() {
      return {
        content: this.#getIconHtml("--icon-submit-answer-html"),
        accessibleName: i18n`4e095ee5de137300bfa0042a6b442b0e::`
      };
    }
    get openMenu() {
      return {
        content: this.#getIconHtml("--icon-open-menu-html"),
        accessibleName: i18n`64d2cc43035360eddf790efbef5ddb30::`
      };
    }
    get warning() {
      return {
        content: this.#getIconHtml("--icon-warning-html"),
        accessibleName: i18n`64d2cc43035360eddf790efbef5ddb30::`
      };
    }
    get yes() {
      return {
        content: this.#getIconHtml("--icon-yes-html"),
        accessibleName: i18n`93cba07454f06a4a960172bbd6e2a435::`
      };
    }
    semanticsAddressRole(element, role) {
      if (!role) return !0;
      return HTML_SEMANTIC_ROLES[element.tagName][element.tagName] == role;
    }
    applyIconToElement(icon, item) {
      let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      const label = options.overrideText ?? icon.accessibleName,
        element = ManagedElement.getElement(item),
        role = options.role?.toLowerCase();
      element.innerHTML = icon.content, icon.accessibleName && !options.hideText && (element.innerHTML += `&nbsp;${label}`), this.semanticsAddressRole(element, role) ? options.hideText && element.setAttribute("aria-label", label) : (element.setAttribute("role", role), element.setAttribute("aria-label", label));
    }
  }();
  const focusManager = new class FocusManager {
    constructor() {
      window.addEventListener("focus", event => {
        console.debug(`Window has focus. Restore focus to active element. Active element ${document.activeElement.tagName} ${document.activeElement.className}`, document.activeElement, event.relatedTarget), document.activeElement !== document.body ? document.activeElement.focus() : this.findBestFocus();
      });
    }
    focusWithin() {
      let containingElement = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document.body;
      const element = containingElement.element ?? containingElement,
        candidates = element.querySelectorAll("button,select,input,.selectable");
      for (const candidate of candidates.values()) if ("none" !== candidate.style.display && "hidden" !== candidate.style.visibility) return candidate.focus(), !0;
      return console.error(`Failed to focus within ${element?.tagName}:${element?.className}`), !1;
    }
    findBestFocus() {
      console.debug("Finding best focus");
      let element = document.querySelector(".selectable.always-on-top");
      if (element) return console.debug(`Focus on ${element.tagName}: ${element.className}`), void element.focus();
      element = document.querySelector(".modal"), element ? (console.debug(`Focus within ${element.tagName}: ${element.className}`), this.focusWithin(element)) : (element = document.querySelector("#content"), console.debug(`Focus within ${element.tagName}: ${element.className}`), this.focusWithin(element));
    }
    setFocus(element) {
      return element.focus(), document.activeElement === element;
    }
  }();
  class BarButton extends ManagedElement {
    constructor(detail) {
      super("button"), detail.content ? icons.applyIconToElement(detail, this.element) : this.innerHTML = detail;
    }
  }
  class ButtonBar extends ManagedElement {
    constructor() {
      super("div", "utils-button-bar");
    }
    showButtons(buttons) {
      buttons?.length || (buttons = [icons.ok]), this.resolutionFunction = null;
      const promise = new Promise(resolve => {
        this.resolutionFunction = resolve;
      });
      return buttons.forEach((value, index) => {
        const button = new BarButton(value);
        button.setAttribute("data-index", index), this.appendChild(button, index), this.listenToEventOn("click", button, index);
      }), focusManager.findBestFocus(), promise;
    }
    handleClickEvent(eventIgnored, eventId) {
      const index = parseInt(eventId);
      this.resolutionFunction(index);
    }
  }
  const mask = document.getElementById("modal-mask"),
    standardSelectionIds = ["title-bar", "content", "footer"];
  let referenceCount = 0,
    itemsToRestore = [];
  function deactivateItems() {
    standardSelectionIds.forEach(id => {
      document.getElementById(id).querySelectorAll("button,.selectable,input,textarea").forEach(element => {
        !function (element) {
          console.debug(`Deactivating ${element.tagName}: ${element.className}`);
          const elementDetails = {
            element: element,
            "aria-hidden": element.getAttribute("aria-hidden"),
            disabled: element.disabled,
            tabIndex: element.tabIndex
          };
          itemsToRestore.push(elementDetails), element.setAttribute("aria-hidden", !0), void 0 !== element.disabled && (element.disabled = !0), element.tabIndex = -1;
        }(element);
      });
    });
  }
  function showMask() {
    mask.style.visibility = "visible", 0 === referenceCount ? deactivateItems() : console.debug(`Reference count ${referenceCount} is > 0 so mask already in place.`), referenceCount++;
  }
  function hideMask() {
    --referenceCount > 0 ? console.debug(`Reference count ${referenceCount} is > 0 so leave mask in place.`) : (itemsToRestore.forEach(item => {
      item.ariaHidden ? item.element.setAttribute("aria-hidden", item.ariaHidden) : item.element.removeAttribute("aria-hidden"), void 0 !== item.disabled && (item.element.disabled = item.disabled), void 0 !== item.tabIndex && (item.element.tabIndex = item.tabIndex);
    }), itemsToRestore = [], mask.style.visibility = "hidden");
  }
  class ModalDialog {
    static DialogType = {
      ERROR: "error",
      FATAL: "fatal",
      INFO: "info",
      QUESTION: "question",
      SETTINGS: "settings",
      WARNING: "warning"
    };
    static DialogIndex = {
      SETTINGS_OK: 0,
      SETTINGS_RESET: 1,
      CONFIRM_YES: 0,
      CONFIRM_NO: 1
    };
    static #isConstructing = !1;
    #dialog;
    #titleText;
    #icon;
    #content;
    #buttonBar;
    constructor() {
      if (!ModalDialog.#isConstructing) throw new Error("ModalDialog should be instantiated via factory method.");
      this.#createHtml();
    }
    static #constructDialog() {
      ModalDialog.#isConstructing = !0;
      const dialog = new ModalDialog();
      return ModalDialog.#isConstructing = !1, dialog;
    }
    #createHtml() {
      this.#dialog = new ManagedElement("div", "utils-dialog"), this.#dialog.classList.add("framed", "modal");
      const titleBar = new ManagedElement("div", "utils-title-bar");
      titleBar.classList.add("container"), this.#icon = new ManagedElement("span", "utils-dialog-icon"), titleBar.appendChild(this.#icon), this.#titleText = new ManagedElement("span"), titleBar.appendChild(this.#titleText);
      const contentFrame = new ManagedElement("div", "utils-dialog-content-frame");
      contentFrame.classList.add("container"), this.#content = new ManagedElement("div", "utils-dialog-content"), contentFrame.appendChild(this.#content), this.#buttonBar = new ButtonBar(), this.#dialog.appendChild(titleBar), this.#dialog.appendChild(contentFrame), this.#dialog.appendChild(this.#buttonBar), this.#dialog.appendTo(document.body);
    }
    #showDialogDefinition(dialogDefinition) {
      return this.#titleText.textContent = dialogDefinition.title, dialogDefinition.content instanceof Element || dialogDefinition.content instanceof ManagedElement ? (this.#content.textContent = "", this.#content.appendChild(dialogDefinition.content)) : this.#content.innerHTML = dialogDefinition.content, icons.applyIconToElement(dialogDefinition.iconDetails, this.#icon, {
        hideText: !0
      }), showMask(), this.#buttonBar.showButtons(dialogDefinition.buttons).then(index => (this.#hideDialog(), focusManager.findBestFocus(), index));
    }
    #hideDialog() {
      hideMask(), this.#dialog.remove();
    }
    static #addReloadWarning(content) {
      let reloadText = i18n`b33bb0b4617140c80c80b10436a0dbb2::`;
      if ("" === reloadText && (reloadText = "A serious error has occurred and languages cannot be loaded. Wait a few minutes and then close this dialog to try to reload the application."), content instanceof Element) {
        const para = document.createElement("p");
        return para.textContent = reloadText, content.appendChild(para), content;
      }
      return `${content}<p>${reloadText}</p>`;
    }
    static showDialog(title, content, options) {
      const dialog = ModalDialog.#constructDialog();
      options?.dialogType === ModalDialog.DialogType.FATAL && (content = ModalDialog.#addReloadWarning(content));
      const iconDetails = function (dialogType) {
          switch (dialogType) {
            case ModalDialog.DialogType.WARNING:
              return icons.warning;
            case ModalDialog.DialogType.ERROR:
              return icons.error;
            case ModalDialog.DialogType.FATAL:
              return icons.fatal;
            case ModalDialog.DialogType.QUESTION:
              return icons.question;
            case ModalDialog.DialogType.SETTINGS:
              return icons.settings;
            case ModalDialog.DialogType.INFO:
            default:
              return icons.info;
          }
        }(options?.dialogType),
        dialogDefinition = {
          title: title && title.length > 0 ? title : ":",
          buttons: options?.buttons,
          content: content,
          dialogType: options?.dialogType,
          iconDetails: iconDetails
        };
      return dialog.#showDialogDefinition(dialogDefinition);
    }
    static showSettingsDialog(content) {
      const options = {
        dialogType: ModalDialog.DialogType.SETTINGS,
        buttons: [icons.ok, icons.resetToFactory]
      };
      return ModalDialog.showDialog(i18n`f4f70727dc34561dfde1a3c529b6205c::`, content, options);
    }
    static showWarning(content, title) {
      return ModalDialog.showDialog(title ?? i18n`0eaadb4fcb48a0a0ed7bc9868be9fbaa::`, content, {
        dialogType: ModalDialog.DialogType.WARNING
      });
    }
    static showError(content, title) {
      return ModalDialog.showDialog(title ?? i18n`902b0d55fddef6f8d651fe1035b7d4bd::`, content, {
        dialogType: ModalDialog.DialogType.ERROR
      });
    }
    static showInfo(content, title) {
      return ModalDialog.showDialog(title ?? i18n`a82be0f551b8708bc08eb33cd9ded0cf::`, content, {
        dialogType: ModalDialog.DialogType.INFO
      });
    }
    static showConfirm(content, title) {
      return ModalDialog.showDialog(title ?? i18n`a97ea56b0e00b2379736ae60869ff66a::`, content, {
        dialogType: ModalDialog.DialogType.QUESTION,
        buttons: [icons.yes, icons.no]
      });
    }
    static showFatal(content, title) {
      return ModalDialog.showDialog(title ?? i18n`355f26b47eff3302c93a1c49676f078e::`, content, {
        dialogType: ModalDialog.DialogType.FATAL
      });
    }
  }
  const reloader = new class Reloader {
    #reloadRequired = !1;
    #reason = "";
    constructor() {}
    flagAsRequired(reason) {
      this.#reason = reason, this.#reloadRequired = !0;
    }
    reloadIfRequired() {
      if (this.#reloadRequired) {
        const warning = i18n`5a1ee4a311c51fa4b76d3c7edd6bdda6::`;
        return ModalDialog.showWarning(`<p>${warning}</p><p>${this.#reason}</p>`).then(() => {
          window.location.reload();
        });
      }
      return Promise.resolve();
    }
  }();
  class SettingsValueCache {
    #storedValues = new Map();
    constructor(definitions) {
      for (const key in definitions) if (definitions[key].reloadIfChanged) {
        const cachedValue = {
          value: persistentData.getFromStorage(key),
          label: definitions[key].label
        };
        this.#storedValues.set(key, cachedValue);
      }
    }
    get changes() {
      let labels = [];
      return this.#storedValues.forEach((cachedValue, key) => {
        persistentData.getFromStorage(key) !== cachedValue.value && labels.push(cachedValue.label);
      }), labels.join(", ");
    }
  }
  class RangeIndicator extends ManagedElement {
    constructor(control) {
      super("div", "utils-range-value"), this.classList.add("on-top"), this.control = control, this.listenToEventOn("input", this.control, ""), this.hide();
    }
    handleInputEvent(event) {
      this.timerId || (this.timerId = setTimeout(() => {
        this.hide(), this.timerId = null;
      }, 500));
      const controlEl = this.control.element,
        minValue = parseFloat(controlEl.min ?? 0),
        maxValue = parseFloat(controlEl.max ?? 100),
        proportion = (parseFloat(controlEl.value) - minValue) / (maxValue - minValue);
      this.textContent = event.target.value, this.style.opacity = 100;
      const top = controlEl.offsetTop - this.offsetHeight;
      let left = controlEl.offsetLeft + controlEl.offsetWidth * proportion - this.offsetWidth / 2;
      left = Math.max(controlEl.offsetLeft, left), left = Math.min(controlEl.offsetLeft + controlEl.offsetWidth - this.offsetWidth, left), this.style.left = `${left}px`, this.style.top = `${top}px`, this.show();
    }
    hide() {
      this.style.opacity = 0, this.style.visibility = "hidden";
    }
    show() {
      this.style.visibility = "visible", this.style.opacity = 100;
    }
  }
  class SeparatorControl extends ManagedElement {
    constructor(key, definition) {
      super("div", "utils-separator"), this.innerHTML = `<span class="utils-hr"><hr></span><span> ${escapeHtml(definition.label)} </span><span class="utils-hr"><hr></span>`;
    }
  }
  class InputControl extends ManagedElement {
    constructor(key, definition) {
      super("input"), this.type = definition.type, this.setAttribute("type", definition.type), this.setAttribute("min", definition.min), this.setAttribute("max", definition.max), this.className = definition.type;
    }
    setValue(value) {
      "checkbox" !== this.type ? this.value = value : this.checked = value;
    }
    getValue() {
      switch (this.type) {
        case "checkbox":
          return this.checked;
        case "range":
          return parseFloat(this.value);
        default:
          return this.value;
      }
    }
  }
  class SelectControl extends ManagedElement {
    constructor(key, definition) {
      super("select"), this.definition = definition, definition.type && (this.className = definition.type), this.#addOptions();
    }
    setValue(value) {
      console.log(value);
      const index = [...this.$.options].findIndex(option => option.value === value);
      index >= 0 ? this.$.selectedIndex = index : console.warn(`Could not set select control to value of ${value}`);
    }
    getValue() {
      return this.$.selectedOptions[0].value;
    }
    getText() {
      return this.$.selectedOptions[0].text;
    }
    #addOptions() {
      this.options = this.definition.options, "function" == typeof this.options && (this.options = this.options.call(this)), "function" == typeof this.options && (this.options = this.options.call(this)), this.options?.forEach((value, key) => {
        const option = new Option(value, key);
        this.$.add(option);
      });
    }
    reloadOptions() {
      if (this.options = this.definition.options, "function" == typeof this.definition.options) {
        let n = this.$.length;
        for (; n-- > 0;) this.$.remove(0);
      }
      this.#addOptions();
    }
  }
  class LabeledControlManager {
    #managedControls = [];
    constructor() {}
    createLabeledControl(key, definition, storage) {
      const control = new LabeledControl(key, definition, {
        storage: storage,
        manager: this
      });
      return this.#managedControls.push(control), control;
    }
    removeControls() {
      this.#managedControls.forEach(control => {
        control.remove();
      });
    }
    reloadSelectOptions(keys) {
      keys?.forEach(value => {
        const dependentControl = this.#managedControls.find(control => control.key === value);
        dependentControl && (dependentControl.control instanceof SelectControl ? dependentControl.control.reloadOptions() : console.log(`Ignoring dependent ${value} as it is not a select type.`));
      });
    }
  }
  class LabeledControl extends ManagedElement {
    #storage;
    #manager;
    constructor(key, definition, options) {
      super("div"), this.#storage = options?.storage, this.#manager = options?.manager, this.className = "labeled-control-container", this.label = new ManagedElement("label"), this.appendChild(this.label), this.key = key, this.definition = definition, this.label.innerHTML = `<span>${escapeHtml(definition.label)}</span>`, "select" === definition.type ? this.control = new SelectControl(key, definition) : this.control = new InputControl(key, definition), this.control.setValue(this.#storage ? this.#storage.getFromStorage(key, definition.defaultValue) : definition.defaultValue), this.label.appendChild(this.control), this.error = this.appendChild(new ManagedElement("div", "utils-input-error-message")), "range" === definition.type && this.label.appendChild(new RangeIndicator(this.control)), this.listenToEventOn("input", this.control, "");
    }
    setValue(value) {
      this.control?.setValue(value);
    }
    handleInputEvent(eventIgnored) {
      const value = this.control.getValue();
      if (this.definition.validate) {
        const validation = this.definition.validate(value);
        if (!validation.pass) return this.error.textContent = validation.errorMessage, void this.classList.add("utils-error");
      }
      this.classList.remove("utils-error"), this.#storage?.saveToStorage(this.key, value), this.definition.onupdate && (this.definition.onupdate(value), this.#manager ? this.#manager.reloadSelectOptions(this.definition.dependents) : console.warn("LabeledControl has no manager, so unable to handle dependencies."));
    }
  }
  let manager = null,
    settingDefinitions = {};
  function resetIfConfirmed() {
    return ModalDialog.showConfirm(i18n`0ee1cf8d6fe2d39a293bc82ddbc60666::`).then(value => {
      if (value === ModalDialog.DialogIndex.CONFIRM_YES) return function () {
        for (const key in settingDefinitions) {
          console.info(`Resetting ${key} to its default.`);
          const definition = settingDefinitions[key];
          if (!isSeparator(definition)) {
            const value = definition.defaultValue;
            persistentData.saveToStorage(key, value), definition.onupdate?.(value);
          }
        }
      }();
    });
  }
  function isSeparator(definition) {
    return "separator" === definition.type;
  }
  function loadSettingDefinitions(definitions) {
    !function (definitions) {
      for (const key in definitions) definitions[key].initialise?.();
    }(definitions), function (definitions) {
      settingDefinitions = definitions;
      for (const key in settingDefinitions) if (!isSeparator(settingDefinitions[key])) {
        const storedValue = persistentData.getFromStorage(key, settingDefinitions[key].defaultValue);
        settingDefinitions[key].onupdate?.call(this, storedValue);
      }
    }(definitions);
  }
  function getMainMenuItems() {
    return [{
      iconDetails: icons.settings,
      command: {
        execute: () => function () {
          if (manager) return Promise.reject(new Error("Attempt made to show settings on top of another."));
          manager = new LabeledControlManager();
          const dialogContent = new ManagedElement("div");
          dialogContent.innerHTML = "\n    <div class='utils-palette'>\n    <span class='utils-primary'></span>\n    <span class='utils-secondary'></span>\n    <span class='utils-tertiary'></span>\n    </div>\n  ";
          for (const key in settingDefinitions) {
            const setting = settingDefinitions[key];
            let control;
            control = isSeparator(setting) ? new SeparatorControl(key, setting) : manager.createLabeledControl(key, setting, persistentData), dialogContent.appendChild(control);
          }
          const settingsValueCache = new SettingsValueCache(settingDefinitions);
          return ModalDialog.showSettingsDialog(dialogContent).then(value => value === ModalDialog.DialogIndex.SETTINGS_RESET ? resetIfConfirmed() : value).then(value => (manager.removeControls(), manager = null, reloader.reloadIfRequired(), value)).then(value => {
            const changes = settingsValueCache.changes;
            return "" !== changes && (reloader.flagAsRequired(`${i18n`3c5d22824f5b26b56b4edfc952f083f7::`} ${changes}.`), reloader.reloadIfRequired()), value;
          });
        }()
      }
    }, {
      iconDetails: null,
      command: null
    }, {
      iconDetails: icons.privacy,
      command: {
        execute: () => window.open(Urls.PRIVACY, "_blank")
      }
    }];
  }
  class I18nResolutionError extends Error {
    constructor(error, fetchSummary) {
      error instanceof Error ? (super(error.message), this.cause = error) : super(error), this.fetchSummary = fetchSummary;
    }
  }
  function resolveLanguages(languagesListingUrl) {
    let languagesListing = {},
      languagesBaseUrl = "",
      fetchSummary = [];
    return fetchJson(languagesListingUrl).then(languages => {
      languagesListing = languages, languagesBaseUrl = new URL(languages.location, window.location.href);
      const url = new URL(languages.meta.master, languagesBaseUrl);
      return fetchSummary.push({
        url: url,
        read: !1
      }), fetchJson(url.href);
    }).then(masterTranslations => {
      fetchSummary[0].read = !0, setActiveTranslations(masterTranslations);
      const bestFile = function (preferredLanguages, availableLanguageFiles) {
        const availableSubTags = availableLanguageFiles.map(entry => extractLanguageSubTags(entry.toLowerCase().replace(/\.json$/i, ""))),
          preferredSubTags = preferredLanguages.map(entry => extractLanguageSubTags(entry));
        let bestMatch = {
          weight: 0,
          file: null
        };
        return preferredSubTags.forEach((prefSubTag, prefIndexIgnored) => {
          const languageIndex = preferredSubTags.findIndex(element => element.language === prefSubTag.language),
            prefSubTagRank = preferredSubTags.length - languageIndex;
          availableSubTags.forEach((availSubTag, availIndex) => {
            let weight = 0;
            prefSubTag.language === availSubTag.language && (weight += 100 * prefSubTagRank, "" !== prefSubTag.region && prefSubTag.region === availSubTag.region && (weight += 10), "" !== prefSubTag.script && prefSubTag.script === availSubTag.script && (weight += 1), weight > bestMatch.weight && (bestMatch.weight = weight, bestMatch.file = availableLanguageFiles[availIndex]));
          });
        }), bestMatch.file;
      }(navigator.languages, languagesListing.files);
      if (bestFile === languagesListing.meta.master) return Promise.resolve(null);
      const url = new URL(bestFile, languagesBaseUrl);
      return fetchSummary.push({
        url: url,
        read: !1
      }), fetchJson(url.href);
    }).then(bestTranslations => (bestTranslations && (fetchSummary[1].read = !0, setActiveTranslations(bestTranslations)), fetchSummary)).catch(error => Promise.reject(new I18nResolutionError(error, fetchSummary)));
  }
  class StageManager {
    #stage;
    constructor(stageElement) {
      this.#stage = new ManagedElement(stageElement);
    }
    async startShow(presenter) {
      for (;;) if (presenter = await presenter.presentOnStage(this.#stage), this.#stage.removeChildren(), null === presenter) return;
    }
  }
  function getErrorAttributeHtml(message) {
    return `data-error="${(content = message, stringToBase64(content))}"`;
    var content;
  }
  const PREDEFINED_EMOJIS = {
    GRINNING: "&#x1F600;",
    ")": "@GRINNING",
    "-)": "@GRINNING",
    SMILEY: "@GRINNING",
    SMILING: "@GRINNING",
    HAPPY: "@GRINNING",
    WORRIED: "&#x1F61F;",
    SAD: "@WORRIED",
    LAUGHING: "&#x1F602;",
    LAUGH: "@LAUGHING",
    CRYING: "&#x1F622;",
    TEAR: "@CRYING",
    FROWNING: "&#x1F641;",
    "(": "@FROWNING",
    "-(": "@FROWNING",
    NEUTRAL: "&#x1F610;",
    ANGRY: "&#x1F620;",
    GRUMPY: "@ANGRY",
    WINK: "&#x1F609;",
    WINKY: "@WINK",
    WINKING: "@WINK",
    WARNING: "&#x26A0;&#xFE0F;",
    ALERT: "@WARNING",
    ERROR: "@WARNING",
    "WHITE-QUESTION-MARK": "&#x2754;"
  };
  const SAFE_CLASSES = ["big", "bigger", "biggest", "small", "smaller", "smallest"];
  class TrackedReplacements {
    #missingWords;
    #replacements;
    get missingWords() {
      return [...this.#missingWords];
    }
    get replacements() {
      return this.#replacements;
    }
    constructor(metadata) {
      this.#missingWords = [];
      const tracker = this;
      this.#replacements = [{
        re: /\\>/g,
        rep: "&gt;"
      }, getItemReplacement("[.]{3}", (match, startChr, word) => (tracker.#missingWords.push(word), `${startChr}<span class="missing-word" data-missing-word="${ManagedElement.encodeString(word)}"></span>`)), getItemReplacement("emoji:", (match, startChr, word, emojiClass) => {
        let requiredClasses = "emoji";
        return (emojiClass = function (requestedClass) {
          if (!requestedClass) return "";
          const index = SAFE_CLASSES.indexOf(requestedClass.toLowerCase());
          return index < 0 ? "" : SAFE_CLASSES[index];
        }(emojiClass)) && (requiredClasses = `${requiredClasses} ${emojiClass}`), `${startChr}<span class="${requiredClasses}">${function (originalDefinition) {
          if (!originalDefinition) return " ";
          const definition = originalDefinition.toUpperCase();
          if (definition.startsWith("U+")) return definition.replaceAll(/U\+([A-F0-9]+)/g, "&#x$1;");
          {
            let code = PREDEFINED_EMOJIS[definition];
            return code?.startsWith("@") && (code = PREDEFINED_EMOJIS[code.substring(1)]), code ? code : `<span ${getErrorAttributeHtml(i18n`5da57f8cd9336099a601a9cb7b512982::${originalDefinition}`)}>${PREDEFINED_EMOJIS["WHITE-QUESTION-MARK"]}</span>`;
          }
        }(word)}</span>`;
      }), getItemReplacement("meta:", (match, startChr, word) => {
        const metavalue = metadata?.getValue(word);
        if (!metavalue) {
          return `${startChr}<span ${getErrorAttributeHtml(i18n`20f59a970faebddc0d41220837f3b4ad::${word}`)}>${word}</span>`;
        }
        return `${startChr}${metavalue}`;
      })];
    }
  }
  class TextItem {
    static #isConstructing = !1;
    #html = "";
    #missingWords = [];
    #metadata;
    constructor(metadata) {
      if (!TextItem.#isConstructing) throw new Error("Private constructor. Use createTextItem");
      this.#metadata = metadata;
    }
    get html() {
      return this.#html;
    }
    get plainText() {
      return getPlainTextFromHtml(this.#html.replace(/<(?:[^>]*missing-word[^>]*)>/g, "..."));
    }
    get missingWords() {
      return this.#missingWords;
    }
    static createFromSource(source, metadata) {
      TextItem.#isConstructing = !0;
      const textItem = new TextItem();
      if (TextItem.#isConstructing = !1, source) {
        const tracker = new TrackedReplacements(metadata);
        textItem.#html = parseMarkdown(source, {
          post: tracker.replacements
        }), textItem.#missingWords = tracker.missingWords;
      }
      return textItem;
    }
    get firstWord() {
      const match = this.#html?.match(/^(?:\s*(?:<\/?[^\r\n\f\t]*?>)*\s*)*([^\s<]*)/);
      return match ? match[1] : "";
    }
  }
  function getItemReplacement(prefix, replace) {
    return {
      re: new RegExp(`(^|[ >])${prefix}((?:&#?[a-zA-Z0-9]+?;|[^\\s<>])+?)?(?:>([a-zA_Z]*))?(?=[\\s,;:.?!]|$|</.+?>)`, "gmi"),
      rep: replace
    };
  }
  class Metadata {
    static #isConstructing = !1;
    #map = new Map();
    constructor() {
      if (!Metadata.#isConstructing) throw new Error("Private constructor. Use createMetaData");
    }
    getValue(key, defaultValue) {
      return this.#map.get(key.toUpperCase()) ?? defaultValue;
    }
    static createFromSource(source) {
      Metadata.#isConstructing = !0;
      const metadata = new Metadata();
      Metadata.#isConstructing = !1;
      return source.split("\n").forEach(element => {
        const match = element.match(/^\s*(\w+)\s*[:;.]-?\s*(.*?)\s*$/);
        match && metadata.#map.set(match[1].toUpperCase(), escapeHtml(match[2]));
      }), metadata;
    }
  }
  const QuestionType_SIMPLE = "simple",
    QuestionType_MULTI = "multi",
    QuestionType_FILL = "fill",
    QuestionType_ORDER = "order",
    QuestionType_SLIDE = "slide";
  class Problem {
    #intro;
    #question;
    #explanation;
    #rightAnswers;
    #wrongAnswers;
    #questionType = QuestionType_SLIDE;
    constructor() {}
    get intro() {
      return this.#intro;
    }
    set intro(value) {
      this.#intro = value;
    }
    get question() {
      return this.#question;
    }
    set question(value) {
      this.#question = value, this.#deriveQuestionType();
    }
    get explanation() {
      return this.#explanation;
    }
    set explanation(value) {
      this.#explanation = value;
    }
    get rightAnswers() {
      return this.#rightAnswers;
    }
    set rightAnswers(value) {
      this.#rightAnswers = value, this.#deriveQuestionType();
    }
    get wrongAnswers() {
      return this.#wrongAnswers;
    }
    get firstWordsOfWrongAnswers() {
      return this.#extractFirstWords(this.wrongAnswers);
    }
    get firstWordsOfRightAnswers() {
      return this.#extractFirstWords(this.rightAnswers);
    }
    #extractFirstWords(data) {
      const words = [];
      return data.forEach(textItem => {
        words.push(textItem.firstWord);
      }), words;
    }
    set wrongAnswers(value) {
      this.#wrongAnswers = value, this.#deriveQuestionType();
    }
    get questionType() {
      return this.#questionType;
    }
    #deriveQuestionType() {
      if (!this.#question?.html) return QuestionType_SLIDE;
      this.#isOrderQuestion() ? this.#questionType = QuestionType_ORDER : this.#isFillQuestion() ? this.#questionType = QuestionType_FILL : this.#isMultiQuestion() ? this.#questionType = QuestionType_MULTI : this.#isSimpleQuestion() ? this.#questionType = QuestionType_SIMPLE : this.#questionType = QuestionType_SLIDE;
    }
    #isSimpleQuestion() {
      return !!this.#rightAnswers && 1 === this.#rightAnswers.length;
    }
    #isMultiQuestion() {
      return !!this.#rightAnswers && this.#rightAnswers.length > 1;
    }
    #isFillQuestion() {
      if (0 === this.#question.missingWords.length) return !1;
      for (const content of this.#question.missingWords) if (!content) return !1;
      return !0;
    }
    #isOrderQuestion() {
      return this.#question.html.match(/<span +class *= *"missing-word".*?><\/span>(?:\s*<\/p>\s*)*$/) && 1 === this.#question.missingWords.length && !this.#question.missingWords[0];
    }
  }
  const MarkState_CORRECT = 0,
    MarkState_INCORRECT = 1,
    MarkState_SKIPPED = 2;
  class ItemMarker {
    #markedItems;
    constructor() {
      this.reset();
    }
    reset() {
      this.#markedItems = [];
    }
    get marks() {
      const marks = {
        correct: 0,
        incorrect: 0,
        skipped: 0,
        markedItems: this.#markedItems
      };
      return this.#markedItems.forEach(markedItem => {
        switch (markedItem.state) {
          case MarkState_CORRECT:
            marks.correct++;
            break;
          case MarkState_INCORRECT:
            marks.incorrect++;
            break;
          case MarkState_SKIPPED:
            marks.skipped++;
        }
      }), marks;
    }
    markItem(item, state) {
      this.#markedItems.push({
        item: item,
        state: state
      });
    }
  }
  class Lesson {
    #metadata;
    #problems = [];
    #problemIndex = 0;
    #marker = new ItemMarker();
    constructor() {
      this.#marker.reset();
    }
    get metadata() {
      return this.#metadata;
    }
    set metadata(value) {
      this.#metadata = value;
    }
    get problems() {
      return this.#problems;
    }
    get marks() {
      return this.#marker.marks;
    }
    addProblem(problem) {
      this.#problems.push(problem);
    }
    restart() {
      this.#problemIndex = 0;
    }
    get hasMoreProblems() {
      return this.#problemIndex < this.#problems.length;
    }
    getNextProblem() {
      return this.#problemIndex < this.#problems.length ? this.#problems[this.#problemIndex++] : null;
    }
    peekAtNextProblem() {
      return this.#problemIndex < this.#problems.length ? this.#problems[this.#problemIndex] : null;
    }
    markProblem(problem, state) {
      this.#marker.markItem(problem, state);
    }
  }
  class ProblemSource {
    #introSource;
    #questionSource;
    #rightAnswerSources;
    #wrongAnswerSources;
    #explanationSource;
    constructor() {
      this.#introSource = "", this.#questionSource = "", this.#rightAnswerSources = [], this.#wrongAnswerSources = [], this.#explanationSource = "";
    }
    get introSource() {
      return this.#introSource;
    }
    set introSource(data) {
      this.#introSource = data;
    }
    get questionSource() {
      return this.#questionSource;
    }
    set questionSource(data) {
      this.#questionSource = data;
    }
    get explanationSource() {
      return this.#explanationSource;
    }
    set explanationSource(data) {
      this.#explanationSource = data;
    }
    get rightAnswerSources() {
      return this.#rightAnswerSources;
    }
    get wrongAnswerSources() {
      return this.#wrongAnswerSources;
    }
    addRightAnswerSource(data) {
      this.#rightAnswerSources.push(data);
    }
    addWrongAnswerSource(data) {
      this.#wrongAnswerSources.push(data);
    }
  }
  const ProblemItemKey_INTRO = "i",
    ProblemItemKey_QUESTION = "?",
    ProblemItemKey_RIGHT_ANSWER = "=",
    ProblemItemKey_WRONG_ANSWER = "x",
    ProblemItemKey_EXPLANATION = "+",
    ProblemItemKey_QUESTION_BREAK = "#";
  class LessonSource {
    static #isConstructing = !1;
    #metaSource;
    #problemSources;
    constructor() {
      if (!LessonSource.#isConstructing) throw new Error("Private constructor. Use createFromSource");
      this.#problemSources = [];
    }
    set metaSource(value) {
      this.#metaSource = value;
    }
    get metaSource() {
      return this.#metaSource;
    }
    get problemSources() {
      return this.#problemSources;
    }
    static createFromSource(source) {
      LessonSource.#isConstructing = !0;
      const lessonSource = new LessonSource();
      LessonSource.#isConstructing = !1;
      const lines = source.split(/\r\n|\n/);
      let currentItemKey = null,
        problemSource = lessonSource.createProblemSource(),
        data = "";
      return lines.forEach(line => {
        const details = lessonSource.getLineDetails(line);
        details.key ? (lessonSource.addDataToProblemSource(problemSource, currentItemKey, data), data = details.content ? `${details.content}\n` : "", lessonSource.isNewProblem(currentItemKey, details.key, problemSource) && (problemSource = lessonSource.createProblemSource()), currentItemKey = details.key) : data += `${details.content}\n`;
      }), data && lessonSource.addDataToProblemSource(problemSource, currentItemKey, data), lessonSource;
    }
    isNewProblem(lastKey, newKey, currentProblem) {
      if (lastKey === ProblemItemKey_QUESTION_BREAK) return !0;
      switch (newKey) {
        case ProblemItemKey_INTRO:
          return !!currentProblem.introSource;
        case ProblemItemKey_QUESTION:
          return !!currentProblem.questionSource;
      }
      return !1;
    }
    addDataToProblemSource(problem, itemType, data) {
      switch (itemType) {
        case ProblemItemKey_INTRO:
          problem.introSource = data;
          break;
        case ProblemItemKey_QUESTION:
          problem.questionSource = data;
          break;
        case ProblemItemKey_RIGHT_ANSWER:
          problem.addRightAnswerSource(data);
          break;
        case ProblemItemKey_WRONG_ANSWER:
          problem.addWrongAnswerSource(data);
          break;
        case ProblemItemKey_EXPLANATION:
          problem.explanationSource = data;
          break;
        case ProblemItemKey_QUESTION_BREAK:
          break;
        default:
          this.metaSource = data;
      }
    }
    createProblemSource() {
      const block = new ProblemSource();
      return this.problemSources.push(block), block;
    }
    getLineDetails(line) {
      const match = line.match(/^ {0,3}(?:\(+([i?=x+#])\1*\)+)(.*)$/i);
      return match ? {
        key: match[1].toLowerCase(),
        content: match[2] ?? ""
      } : {
        key: void 0,
        content: line
      };
    }
    convertToLesson() {
      const lesson = new Lesson();
      return lesson.metadata = Metadata.createFromSource(this.metaSource), this.problemSources.forEach(problemSource => {
        const problem = new Problem();
        problem.intro = TextItem.createFromSource(problemSource.introSource, lesson.metadata), problem.question = TextItem.createFromSource(problemSource.questionSource, lesson.metadata), problem.explanation = TextItem.createFromSource(problemSource.explanationSource, lesson.metadata), problem.rightAnswers = problemSource.rightAnswerSources.map(source => TextItem.createFromSource(source, lesson.metadata)), problem.wrongAnswers = problemSource.wrongAnswerSources.map(source => TextItem.createFromSource(source, lesson.metadata)), lesson.addProblem(problem);
      }), lesson;
    }
  }
  class UnmanagedLesson {
    static DATA_KEY = "data";
    static TITLE_KEY = "title";
    #data;
    #title;
    #lesson;
    #origin;
    constructor(title, data, origin) {
      this.#title = title, data && (this.#lesson = this.#convertDataToLesson(data)), this.#origin = origin;
    }
    #convertDataToLesson(data) {
      return LessonSource.createFromSource(data).convertToLesson();
    }
    get hasLesson() {
      return !!this.#lesson;
    }
    get lesson() {
      return this.#lesson;
    }
    get lessonInfo() {
      return lessonManager.getUnmanagedLessonInfo(escapeHtml(this.#title), this.#origin);
    }
  }
  class SessionLesson extends UnmanagedLesson {
    static DATA_KEY = "data";
    static TITLE_KEY = "title";
    constructor() {
      super(SessionLesson.#getSessionItem(SessionLesson.TITLE_KEY), SessionLesson.#getSessionItem(SessionLesson.DATA_KEY), LessonOrigin_SESSION);
    }
    static #getSessionItem(key) {
      const storedValue = sessionStorage.getItem(key);
      return storedValue ? base64ToString(storedValue) : storedValue;
    }
  }
  const sessionLesson = new SessionLesson();
  class ArrayIndexer {
    #items;
    #wrap;
    #index;
    constructor(items) {
      let wrap = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : !0;
      this.#items = items, this.#wrap = wrap, this.#index = 0;
    }
    get items() {
      return this.#items;
    }
    reset() {
      this.#index = 0;
    }
    decrement() {
      return this.#index > 0 ? --this.#index : this.#index = this.#wrap ? this.#items.length - 1 : this.#index - 1, this.#items[this.#index];
    }
    increment() {
      return this.#index < this.#items.length - 1 ? ++this.#index : this.#index = this.#wrap ? 0 : this.#index, this.#items[this.#index];
    }
  }
  class Presenter extends ManagedElement {
    static HOME_ID = "HOME";
    static PREVIOUS_ID = "BACKWARDS";
    static NEXT_ID = "FORWARDS";
    #resolutionExecutor;
    config;
    #navigator;
    #preamble;
    #presentation;
    get presentation() {
      return this.#presentation;
    }
    #buttonBar;
    #homeButton;
    #backwardsButton;
    #forwardsButton;
    constructor(config) {
      let presentationTagName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "div";
      super("div"), this.#addClassNames(), this.config = config, this.#buildContent(presentationTagName);
    }
    #addClassNames() {
      let item = this;
      do {
        this.classList.add(item.constructor.name), item = Object.getPrototypeOf(item);
      } while ("Object" !== item.constructor.name);
    }
    #buildContent(presentationTagName) {
      this.#preamble = new ManagedElement("div", "preamble"), this.#presentation = new ManagedElement(presentationTagName, "presentation"), this.#buttonBar = new ManagedElement("div", "button-bar"), this.#addNavigationButtons(), this.appendChild(this.#preamble), this.appendChild(this.#presentation), this.appendChild(this.#buttonBar);
    }
    expandPresentation() {
      this.#presentation.classList.add("expanded");
    }
    addButtonToBar(managedButton) {
      this.#buttonBar.element.insertBefore(managedButton.element, this.#buttonBar.element.lastElementChild);
    }
    addPreamble(data) {
      this.#preamble.removeChildren(), "string" == typeof data ? this.#preamble.innerHTML = data : this.#preamble.appendChild(data);
    }
    #addNavigationButtons() {
      this.#homeButton = new ManagedElement("button", "home-navigation"), icons.applyIconToElement(icons.home, this.#homeButton), this.listenToEventOn("click", this.#homeButton, Presenter.HOME_ID), this.#buttonBar.appendChild(this.#homeButton), this.#backwardsButton = new ManagedElement("button", "back-navigation"), icons.applyIconToElement(icons.back, this.#backwardsButton), this.listenToEventOn("click", this.#backwardsButton, Presenter.PREVIOUS_ID), this.#buttonBar.appendChild(this.#backwardsButton), this.#backwardsButton.hide(), this.#forwardsButton = new ManagedElement("button", "forward-navigation"), icons.applyIconToElement(icons.forward, this.#forwardsButton), this.listenToEventOn("click", this.#forwardsButton, Presenter.NEXT_ID), this.#buttonBar.appendChild(this.#forwardsButton), this.#forwardsButton.hide();
    }
    hideHomeButton() {
      this.#homeButton.hide();
    }
    showBackButton() {
      this.#backwardsButton.show(), focus && this.#backwardsButton.focus();
    }
    showNextButton(focus) {
      this.#forwardsButton.show(), focus && this.#forwardsButton.focus();
    }
    applyIconToNextButton(iconDetails, overrideText) {
      icons.applyIconToElement(iconDetails, this.#forwardsButton, {
        overrideText: overrideText
      });
    }
    autoAddKeydownEvents(managedElements) {
      if (this.#navigator) return void console.error("autoAddKeydownEvents can only be called once.");
      const items = managedElements ?? this.#presentation.managedChildren;
      this.#navigator = new ArrayIndexer(items, !0), items.forEach((item, index) => {
        this.listenToEventOn("keydown", item, index);
      });
    }
    next(indexIgnored) {
      return this.config.factory.getNext(this, this.config);
    }
    previous() {
      return this.config.factory.getPrevious(this, this.config);
    }
    presentOnStage(stageElement) {
      return new Promise(resolve => {
        this.#resolutionExecutor = resolve, stageElement.appendChild(this), focusManager.focusWithin(stageElement);
      });
    }
    async askIfOkayToLeave(message) {
      return (await ModalDialog.showConfirm(message)) === ModalDialog.DialogIndex.CONFIRM_YES;
    }
    async allowNavigation(eventIgnored, eventIdIgnored) {
      return !0;
    }
    async handleClickEvent(event, eventId) {
      const index = parseInt(eventId),
        upperCaseId = eventId ? eventId.toString().toUpperCase() : "";
      if ((upperCaseId === Presenter.HOME_ID || upperCaseId === Presenter.PREVIOUS_ID || upperCaseId === Presenter.NEXT_ID) && !(await this.allowNavigation(event, eventId))) return !0;
      let nextPresenter = null;
      nextPresenter = upperCaseId === Presenter.PREVIOUS_ID ? this.previous() : upperCaseId === Presenter.NEXT_ID ? this.next(Presenter.NEXT_ID) : upperCaseId === Presenter.HOME_ID ? this.config.factory.getHome(this.config) : this.next(isNaN(index) ? eventId : index), nextPresenter && this.#resolutionExecutor(nextPresenter);
    }
    handleKeydownEvent(event, eventId) {
      const index = parseInt(eventId);
      if (console.debug(`Key ${event.key} down for index ${index}`), !isNaN(index)) switch (event.key) {
        case " ":
        case "Enter":
          this.handleClickEvent(event, eventId);
      }
    }
  }
  class FileInputButton extends ManagedElement {
    static DATA_AVAILABLE_EVENT_NAME = "dataAvailable";
    #input;
    constructor(overrideText) {
      super("label", "file-input-button"), this.classList.add("selectable"), this.#input = new ManagedElement("input"), this.#input.setAttribute("type", "file"), icons.applyIconToElement(icons.import, this, {
        overrideText: overrideText
      }), this.#input.style.visibility = "hidden", this.#input.style.height = "1em", this.appendChild(this.#input), this.listenToEventOn("change", this.#input);
    }
    handleChangeEvent(eventIgnored, eventIdIgnored) {
      const file = this.#input.element.files[0];
      if (!file) return;
      const reader = new FileReader(),
        control = this;
      reader.addEventListener("load", () => {
        reader.result, control.dispatchEvent(new CustomEvent(FileInputButton.DATA_AVAILABLE_EVENT_NAME, {
          detail: {
            file: file,
            content: reader.result
          }
        }));
      }), reader.readAsText(file);
    }
  }
  class LessonExporter {
    #title;
    #content;
    constructor(title, content) {
      this.#title = title, this.#content = content;
    }
    getDataUri(data) {
      return `data:text/plain;charset=utf-8,${encodeURIComponent(data)}`;
    }
    get lessonAsString() {
      return JSON.stringify({
        title: this.#title,
        content: this.#content
      });
    }
    getFilename(extension) {
      return `${this.#title.replace(/[^A-Za-z0-9_-]/g, "_").substring(0, 32)}.${extension}`;
    }
    exportLesson() {
      return ModalDialog.showDialog(i18n`b68686a697ec08b09db6d729aed81c71::`, i18n`5ae903bf09202faef9d5fcedbf21cf14::`, {
        dialogType: ModalDialog.DialogType.QUESTION,
        buttons: [icons.export, icons.exportAutoRun]
      }).then(index => 0 === index ? this.exportPlainLesson() : this.exportAutoRunLesson());
    }
    exportPlainLesson() {
      this.saveDataToFile(stringToBase64(this.lessonAsString), "txt");
    }
    exportAutoRunLesson() {
      const html = function (b64Title, b64LessonData) {
        const rootUrl = window.location.href.replace(/index\.html(\?.*)?$/, "");
        return `<!DOCTYPE html>\n\x3c!-- \nText2Lesson loader.\n--\x3e\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Text2Lesson: Embedded lesson runner</title>\n    <style>\n      * {\n        margin: 0;\n        padding: 0;\n      }\n      html {\n        height: -webkit-fill-available; \n      }\n      body {\n        overflow: hidden;\n      }\n      noscript {\n        left: 0;\n        position: absolute;\n        top: 0;\n      }\n      #progress {\n        padding: 1em;\n        position: absolute;\n        width: 60vw;\n        margin-top: 50vh;\n        left: 0;\n        top: 0;\n        z-index: 10;\n      }\n      iframe {\n        border: 0;\n        width: 100vw;\n        height: 100vh;\n      }\n    </style>\n  </head>\n  <body>\n    <iframe id="data-loader"></iframe>\n    <div id="progress"></div>\n    <noscript class="always-on-top">\n      <p>\n        Your browser does not support scripts and so this application cannot\n        run. If you've disabled scripts, you will need to enable them to\n        proceed. Sorry.\n      </p>\n    </noscript>\n  </body>\n  <script>\n    const LESSON_TITLE_B64 = "${b64Title}";\n    const LESSON_SOURCE_B64 = "${b64LessonData}";\n\n    const LOADER_URL = '${rootUrl}session-data-builder.html';\n    const APPLICATION_URL = '${rootUrl}index.html';\n    const loader = document.getElementById('data-loader');\n    const progress = document.getElementById('progress');\n    const dataChunks = LESSON_SOURCE_B64.match(/.{1,1800}/g);\n    progress.innerHTML = 'Loading: ';\n    let index = -1;\n    loaded = false;\n    const eventListener = loader.addEventListener('load', () => {\n      if (loaded) {\n        return;\n      }\n      progress.innerHTML += ' .';\n      if (index < dataChunks.length) {\n        if (index < 0) {\n          loader.src = \`\${LOADER_URL}?title=\${encodeURI(LESSON_TITLE_B64)}\`;\n          index++;\n        } else {\n          loader.src = \`\${LOADER_URL}?data=\${encodeURI(dataChunks[index++])}\`;\n        }\n      } else {\n        window.location.replace(APPLICATION_URL);\n        loaded = true;\n        progress.style.display = 'none';\n      }\n    });\n    loader.src = \`\${LOADER_URL}\`;\n  <\/script>\n</html>\n`;
      }(stringToBase64(this.#title), stringToBase64(this.#content));
      this.saveDataToFile(html, "html");
    }
    saveDataToFile(data, extension) {
      const tempA = document.createElement("a");
      tempA.setAttribute("href", this.getDataUri(data)), tempA.setAttribute("download", this.getFilename(extension)), tempA.addEventListener("click", () => {
        document.body.removeChild(tempA);
      }), document.body.appendChild(tempA), tempA.click();
    }
  }
  class LessonImporter {
    constructor() {}
    convert(exportedData) {
      if (this.isDataPlainText(exportedData)) return {
        title: "",
        content: exportedData
      };
      try {
        return JSON.parse(base64ToString(exportedData));
      } catch (error) {
        return console.error(error), null;
      }
    }
    isDataPlainText(data) {
      return !!data.match(/^ {0,3}(?:\(+([i?])\1*\)+)(.*)$/m);
    }
  }
  class Toast extends ManagedElement {
    constructor(message, rawHtml) {
      super("div", "utils-toast"), this.classList.add("selectable", "always-on-top"), this.setAttributes({
        "aria-role": "alert",
        tabindex: "0"
      });
      const content = new ManagedElement("div", "container"),
        icon = new ManagedElement("div");
      icons.applyIconToElement(icons.closeMenu, icon.element, {
        hideText: !0
      }), this.appendChild(content), this.appendChild(icon), rawHtml ? content.innerHTML = message : content.textContent = message, this.listenToOwnEvent("click", ""), this.listenToOwnEvent("keydown", "");
    }
    #dismiss() {
      this.style.opacity = 0, this.remove(), focusManager.findBestFocus();
    }
    handleClickEvent(eventIgnored) {
      this.#dismiss();
    }
    handleKeydownEvent(event) {
      console.debug(`Key ${event.key}`), "Escape" !== event.key && " " !== event.key && "Enter" !== event.key || this.#dismiss();
    }
  }
  function toast(message) {
    const toast = new Toast(message);
    document.body.appendChild(toast.element), setTimeout(() => {
      toast.style.top = "45vh", toast.focus();
    });
  }
  class HomePresenter extends Presenter {
    static REMOTE_LIBRARY_ID = "REMOTE";
    static LOCAL_LIBRARY_ID = "LOCAL";
    static FILE_LIBRARY_ID = "FILE_SYSTEM";
    #importSummary;
    constructor(config) {
      config.titles = [i18n`d6e5c296474cad126efdfa515a47f1f8::`, i18n`d63e17b8da99189aff04b37070c61c8e::`], config.itemClassName = "library", super(config), this.#buildContent(), this.hideHomeButton();
    }
    #buildContent() {
      let button = new ManagedElement("button");
      icons.applyIconToElement(icons.library, button, {
        overrideText: i18n`adc4c5f402b068fae17cc33ecf648d5d::`
      }), this.presentation.appendChild(button), this.listenToEventOn("click", button, HomePresenter.REMOTE_LIBRARY_ID), button = new ManagedElement("button"), icons.applyIconToElement(icons.library, button, {
        overrideText: i18n`38e69d0f533dbbdcb17089ef96094b43::`
      }), this.presentation.appendChild(button), this.listenToEventOn("click", button, HomePresenter.LOCAL_LIBRARY_ID), button = new FileInputButton(i18n`9148a8aa9f535484f03b98ae018a76b6::`), this.presentation.appendChild(button), this.listenToEventOn(FileInputButton.DATA_AVAILABLE_EVENT_NAME, button, HomePresenter.FILE_LIBRARY_ID), this.addPreamble(parseMarkdown(i18n`
Hi! Welcome to Text2Lesson.
This is the fun way to learn coding. This is intend to take you from absolutely
no knowledge to being able to write code in HTML, CSS and JavaScript. What!
you don't know what those are! Don't worry, you soon will.
Let's get started.

Click continue to access the lesson library and see what is available.

`));
    }
    handleDataAvailableEvent(event, eventIdIgnored) {
      const importer = new LessonImporter();
      this.#importSummary = importer.convert(event.detail.content), this.#importSummary ? this.handleClickEvent(event, HomePresenter.FILE_LIBRARY_ID) : toast(`Unable to import the file ${event.detail?.file?.name}. The file may be corrupt or the wrong type of file.`);
    }
    next(index) {
      if (index === HomePresenter.FILE_LIBRARY_ID) {
        const unmanagedLesson = new UnmanagedLesson(this.#importSummary.title, this.#importSummary.content, LessonOrigin_FILE_SYSTEM);
        return this.config.lesson = unmanagedLesson.lesson, this.config.lessonInfo = unmanagedLesson.lessonInfo, this.config.factory.getSuitableProblemPresenter(this.config);
      }
      return lessonManager.usingLocalLibrary = index === HomePresenter.LOCAL_LIBRARY_ID, super.next(index);
    }
  }
  class ListPresenter extends Presenter {
    constructor(config) {
      super(config, "ul"), this.#buildContent();
    }
    #buildContent() {
      this.config?.titles?.forEach((title, index) => {
        const itemElement = new ManagedElement("li", this.config.itemClassName);
        itemElement.setAttribute("tabindex", "0"), itemElement.classList.add("selectable"), this.presentation.appendChild(itemElement), itemElement.innerHTML = title, this.listenToEventOn("click", itemElement, index);
      }), this.config?.factory?.hasPrevious(this) && this.showBackButton();
    }
  }
  class LibraryPresenter extends ListPresenter {
    constructor(config) {
      config.titles = lessonManager.bookTitles, config.itemClassName = "book", super(config), this.#buildPreamble(), this.autoAddKeydownEvents();
    }
    #buildPreamble() {
      this.addPreamble(`<span class='library-title'>${lessonManager.libraryTitle}</span>`);
    }
    next(index) {
      return lessonManager.bookIndex = index, super.next(index);
    }
  }
  class BookPresenter extends ListPresenter {
    constructor(config) {
      config.titles = lessonManager.chapterTitles, config.itemClassName = "chapter", super(config), this.autoAddKeydownEvents(), this.#buildPreamble();
    }
    #buildPreamble() {
      this.addPreamble(`<span class='library-title'>${lessonManager.libraryTitle}</span>\n    <span class='book-title'>${lessonManager.bookTitle}</span>\n    `);
    }
    next(index) {
      return lessonManager.chapterIndex = index, super.next(index);
    }
  }
  class ChapterPresenter extends ListPresenter {
    constructor(config) {
      config.titles = lessonManager.lessonTitles, config.itemClassName = "lesson", super(config), this.#buildPreamble(), this.autoAddKeydownEvents();
    }
    #buildPreamble() {
      lessonManager.usingLocalLibrary ? this.addPreamble(`<span class='library-title'>${lessonManager.libraryTitle}</span>`) : this.addPreamble(`<span class='library-title'>${lessonManager.libraryTitle}</span>\n        <span class='book-title'>${lessonManager.bookTitle}</span>\n        <span class='chapter-title'>${lessonManager.chapterTitle}</span>\n        `);
    }
    next(index) {
      return lessonManager.lessonIndex = index, super.next(index);
    }
  }
  class LessonPresenter extends Presenter {
    static EDIT_EVENT_ID = "EDIT_LESSON";
    constructor(config) {
      config.titles = ["placeholder"], config.itemClassName = "lesson-summary", super(config), this.config.lessonInfo = lessonManager.currentLessonInfo, this.#buildCustomContent(), this.autoAddKeydownEvents(), this.config?.factory?.hasPrevious(this) && this.showBackButton();
    }
    #buildCustomContent() {
      this.presentation.createAndAppendChild("h2", null, i18n`8f8bfb5f6d96fb3113a39f781f6fffe4::`);
      const summaryBlock = this.presentation.createAndAppendChild("div", "lesson-summary");
      summaryBlock.createAndAppendChild("span", "lesson-title", this.config.lessonInfo.titles.lesson), summaryBlock.createAndAppendChild("p", null, i18n`d6cd575eb2dab528448d6c6810598452::`), summaryBlock.createAndAppendChild("span", "library-title", this.config.lessonInfo.titles.library), lessonManager.usingLocalLibrary || (summaryBlock.createAndAppendChild("span", "book-title", this.config.lessonInfo.titles.book), summaryBlock.createAndAppendChild("span", "chapter-title", this.config.lessonInfo.titles.chapter)), this.presentation.appendChild(summaryBlock), this.applyIconToNextButton(icons.playLesson), this.showNextButton(), this.#addEditButtonIfLocal();
    }
    #addEditButtonIfLocal() {
      if (this.config.lessonInfo.usingLocalLibrary) {
        const editButton = new ManagedElement("button");
        icons.applyIconToElement(icons.edit, editButton), this.addButtonToBar(editButton), this.listenToEventOn("click", editButton, LessonPresenter.EDIT_EVENT_ID);
      }
    }
    next(eventId) {
      return eventId === LessonPresenter.EDIT_EVENT_ID ? this.config.factory.getEditor(this, this.config) : lessonManager.loadCurrentLesson().then(cachedLesson => {
        const lessonSource = LessonSource.createFromSource(cachedLesson.content);
        return this.config.lesson = lessonSource.convertToLesson(), this.config.factory.getNext(this, this.config);
      });
    }
    previous() {
      return this.config.factory.getPrevious(this, this.config);
    }
  }
  class LessonEditorPresenter extends Presenter {
    static SAVE_EVENT_ID = "SAVE";
    static EXPORT_EVENT_ID = "EXPORT";
    static IMPORT_EVENT_ID = "IMPORT";
    #lessonTitleElement;
    #lessonTitleValue;
    #mainEditorElement;
    #saveButton;
    #importForm;
    #importButton;
    #exportButton;
    #dirty;
    constructor(config) {
      config.titles = ["placeholder"], config.itemClassName = "lesson-editor", super(config), this.#buildCustomContent(), this.#addSaveButton(), this.#addImportButton(), this.#addExportButton(), this.expandPresentation(), this.#setEditorAsClean(), this.applyIconToNextButton(icons.closeEditor), this.showNextButton(), this.#dirty = !1;
    }
    async #buildCustomContent() {
      const cachedLesson = await lessonManager.loadCurrentLesson();
      this.#lessonTitleValue = this.config.lessonInfo.titles.lesson, this.#lessonTitleElement = new LabeledControl(LocalLibrary, {
        defaultValue: this.#lessonTitleValue,
        label: i18n`b78a3223503896721cca1303f776159b::`,
        type: "input",
        onupdate: value => {
          this.#lessonTitleValue = value, this.#setEditorAsDirty();
        }
      }, {
        storage: null
      }), this.addPreamble(this.#lessonTitleElement), this.#mainEditorElement = this.presentation.createAndAppendChild("textarea", "lesson-editor", cachedLesson.content), this.listenToEventOn("input", this.#mainEditorElement);
    }
    #setEditorAsDirty() {
      this.#saveButton.disabled = !1, this.#dirty = !0;
    }
    #setEditorAsClean() {
      this.#saveButton.disabled = !0, this.#dirty = !1;
    }
    #addSaveButton() {
      this.#saveButton = new ManagedElement("button"), icons.applyIconToElement(icons.save, this.#saveButton), this.listenToEventOn("click", this.#saveButton, LessonEditorPresenter.SAVE_EVENT_ID), this.addButtonToBar(this.#saveButton);
    }
    #addImportButton() {
      this.#importForm = new ManagedElement("form", "button-wrapper"), this.#importButton = new FileInputButton(), this.#importForm.appendChild(this.#importButton), this.listenToEventOn(FileInputButton.DATA_AVAILABLE_EVENT_NAME, this.#importButton, LessonEditorPresenter.IMPORT_EVENT_ID), this.addButtonToBar(this.#importForm);
    }
    #addExportButton() {
      this.#exportButton = new ManagedElement("button"), icons.applyIconToElement(icons.export, this.#exportButton), this.listenToEventOn("click", this.#exportButton, LessonEditorPresenter.EXPORT_EVENT_ID), this.addButtonToBar(this.#exportButton);
    }
    handleDataAvailableEvent(event, eventIdIgnored) {
      this.#importForm.element.reset();
      const importSummary = new LessonImporter().convert(event.detail.content);
      if (importSummary) return ModalDialog.showConfirm(i18n`b087a0f6368816df1cbbf2700e7de192::`).then(answer => {
        answer === ModalDialog.DialogIndex.CONFIRM_YES && (this.#lessonTitleElement.setValue(importSummary.title), this.#lessonTitleValue = importSummary.title, this.#mainEditorElement.value = importSummary.content, this.#setEditorAsDirty());
      });
      toast(`Unable to import the file ${event.detail?.file?.name}. The file may be corrupt or the wrong type of file.`);
    }
    handleInputEvent(eventIgnored, eventIdIgnored) {
      this.#setEditorAsDirty();
    }
    async allowNavigation(eventIgnored, eventIdIgnored) {
      return !this.#dirty || this.askIfOkayToLeave(i18n`0fd040b4b27f744bd6c771e624f1a466::`);
    }
    handleClickEvent(event, eventId) {
      switch (eventId) {
        case LessonEditorPresenter.SAVE_EVENT_ID:
          return this.#saveLessonLocally();
        case LessonEditorPresenter.EXPORT_EVENT_ID:
          return this.#exportLesson();
        default:
          return super.handleClickEvent(event, eventId);
      }
    }
    #saveLessonLocally() {
      lessonManager.updateCurrentLessonContent(this.#lessonTitleValue, this.#mainEditorElement.value), this.#setEditorAsClean();
    }
    #exportLesson() {
      new LessonExporter(this.#lessonTitleValue, this.#mainEditorElement.value).exportLesson();
    }
  }
  const CelebrationType_HAPPY = "smiley-face",
    CelebrationType_SAD = "sad-face";
  const celebrator = new class Celebrator extends ManagedElement {
      #animationClass;
      #busy;
      constructor() {
        super("div", "celebrator"), this.appendTo(document.body), this.listenToOwnEvent("animationend"), this.#busy = !1, this.hide();
      }
      handleAnimationendEvent(eventIgnored, eventIdIgnored) {
        console.debug("Celebration ended."), this.hide(), this.#busy = !1;
      }
      celebrate() {
        let celebration = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : CelebrationType_HAPPY;
        this.#busy ? console.warn("Celebration busy so new celebration ignored.") : (this.show(), this.#animationClass && this.classList.remove(this.#animationClass), this.#animationClass = celebration, this.classList.add(this.#animationClass));
      }
    }(),
    ClassName = {
      ANSWER: "problem-answer",
      ANSWERS: "problem-answers",
      EXPLANATION: "problem-explanation",
      INCORRECT_ANSWER: "incorrect-answer",
      CORRECT_ANSWER: "correct-answer",
      MISSED_ANSWER: "missed-answer",
      AVOIDED_ANSWER: "avoided-answer",
      QUESTION: "problem-question",
      SELECTED_ANSWER: "selected-answer"
    },
    ElementId_CLICKED_ANSWER = "answer",
    ElementId_CLICKED_SUBMIT = "submit",
    Attribute_RIGHT_OR_WRONG = "data-code",
    AnswerSelectionState_CORRECT = 1,
    AnswerSelectionState_INCORRECT = 2,
    AnswerSelectionState_MISSED = 3,
    AnswerSelectionState_AVOIDED = 4;
  class ProblemPresenter extends Presenter {
    #problem;
    #questionElement;
    #answerElement;
    #explanationElement;
    #submitButton;
    #freezeAnswers;
    constructor(config) {
      config.titles = [], config.itemClassName = "", super(config, "div"), this.#problem = config.lesson.getNextProblem(), this.#questionElement = new ManagedElement("div", ClassName.QUESTION), this.#questionElement.innerHTML = this.#problem.question.html, this.#answerElement = new ManagedElement("div", ClassName.ANSWERS), this.#explanationElement = new ManagedElement("div", ClassName.EXPLANATION), this.#explanationElement.innerHTML = this.#problem.explanation.html, this.#explanationElement.hide(), this.presentation.appendChild(this.#questionElement), this.presentation.appendChild(this.#answerElement), this.presentation.appendChild(this.#explanationElement), this.addButtons(), this.#submitButton.show(), this.#freezeAnswers = !1, this.config.lessonInfo.managed || this.hideHomeButton();
    }
    get problem() {
      return this.#problem;
    }
    get questionElement() {
      return this.#questionElement;
    }
    get answerElement() {
      return this.#answerElement;
    }
    get explanationElement() {
      return this.#explanationElement;
    }
    get submitButton() {
      return this.#submitButton;
    }
    addButtons() {
      this.#addSubmitButton();
    }
    #addSubmitButton() {
      this.#submitButton = new ManagedElement("button", ClassName.ANSWER_SUBMIT), icons.applyIconToElement(icons.submitAnswer, this.#submitButton.element), this.listenToEventOn("click", this.#submitButton, ElementId_CLICKED_SUBMIT), this.addButtonToBar(this.#submitButton);
    }
    presentOnStage(stage) {
      return "" !== this.#problem.intro.html && this.#problem.questionType !== QuestionType_SLIDE ? ModalDialog.showInfo(this.#problem.intro.html).then(() => super.presentOnStage(stage)) : super.presentOnStage(stage);
    }
    handleClickEvent(event, eventId) {
      switch (eventId) {
        case ElementId_CLICKED_ANSWER:
          this.#freezeAnswers || this.processClickedAnswer(event.currentTarget);
          break;
        case ElementId_CLICKED_SUBMIT:
          this.#freezeAnswers = !0, this.#processClickedSubmit();
          break;
        default:
          super.handleClickEvent(event, eventId);
      }
    }
    async allowNavigation(event, eventId) {
      return eventId !== Presenter.HOME_ID && eventId !== Presenter.PREVIOUS_ID || this.askIfOkayToLeave(i18n`d54132fd8e2fa9a6c89e8c27bc122fc2::`);
    }
    processClickedAnswer(target) {
      console.debug(`Process ${target.tagName}:${target.className}`);
    }
    #processClickedSubmit() {
      const correct = this.areAnswersCorrect();
      this.config.lesson.markProblem(this.#problem, correct ? MarkState_CORRECT : MarkState_INCORRECT), this.#submitButton.hide(), this.showNextButton(!0), celebrator.celebrate(correct ? CelebrationType_HAPPY : CelebrationType_SAD);
    }
    areAnswersCorrect() {
      return console.debug("Override markAnswers should be overridden."), !1;
    }
  }
  class ChoiceProblemPresenter extends ProblemPresenter {
    #answerListElement;
    constructor(config) {
      super(config), this.#buildSimpleOrMultiple();
    }
    #buildSimpleOrMultiple() {
      this.#buildAnswers(), this.autoAddKeydownEvents(this.answerElement.managedChildren);
    }
    #buildAnswers() {
      this.#answerListElement = new ManagedElement("ul"), this.answerElement.appendChild(this.#answerListElement), this.#answerListElement.setAttributes({
        "aria-label": i18n`3e67adbbda024584ca573026d35039d0::`,
        "aria-role": this.problem.questionType === QuestionType_MULTI ? "" : "radiogroup"
      });
      const answers = [];
      this.#pushAnswerElementsToArray(this.problem.rightAnswers, answers, !0), this.#pushAnswerElementsToArray(this.problem.wrongAnswers, answers, !1), function (data) {
        for (var count = data.length; count;) {
          const index = Math.floor(Math.random() * count--);
          [data[count], data[index]] = [data[index], data[count]];
        }
      }(answers), answers.forEach(element => {
        this.#answerListElement.appendChild(element), this.listenToEventOn("click", element, ElementId_CLICKED_ANSWER), this.listenToEventOn("keydown", element, ElementId_CLICKED_ANSWER);
      }), setTimeout(() => this.#answerListElement.children[0].focus());
    }
    #pushAnswerElementsToArray(answers, destination, areRight) {
      const role = this.problem.questionType === QuestionType_MULTI ? "checkbox" : "radio";
      answers.forEach(value => {
        const element = new ManagedElement("li", ClassName.ANSWER);
        element.classList.add("selectable"), element.innerHTML = value.html, element.setSafeAttribute(Attribute_RIGHT_OR_WRONG, areRight), element.setAttributes({
          tabindex: "0",
          "aria-role": role,
          "aria-checked": !1,
          "aria-label": i18n`e5f965d7cf958839a31acefa71728846::`
        }), destination.push(element);
      });
    }
    processClickedAnswer(element) {
      switch (this.problem.questionType) {
        case QuestionType_MULTI:
          element.classList.toggle(ClassName.SELECTED_ANSWER);
          break;
        case QuestionType_SIMPLE:
          {
            const selected = element.classList.contains(ClassName.SELECTED_ANSWER);
            this.#deselectAllAnswers(), selected || this.#selectAnswer(element);
          }
          break;
        default:
          console.error(`Wrong presenter ${this.constructor.name} being used for ${this.problem.questionType}`);
      }
    }
    #selectAnswer(element) {
      element.setAttribute("aria-checked", "true"), element.classList.add(ClassName.SELECTED_ANSWER);
    }
    #deselectAnswer(element) {
      element.setAttribute("aria-checked", "false"), element.classList.remove(ClassName.SELECTED_ANSWER);
    }
    #deselectAllAnswers() {
      document.querySelectorAll(`.${ClassName.ANSWER}`).forEach(element => {
        this.#deselectAnswer(element);
      });
    }
    areAnswersCorrect() {
      let correct = !0;
      return document.querySelectorAll(`.${ClassName.ANSWER}`).forEach(element => {
        this.#processAnswerState(element) || (correct = !1), element.classList.replace("selectable", "selectable-off"), element.setAttribute("tabindex", "-1");
      }), correct;
    }
    #processAnswerState(element) {
      this.freezeAnswers = !0;
      const elementIsCorrect = "true" === ManagedElement.getSafeAttribute(element, Attribute_RIGHT_OR_WRONG).toLowerCase(),
        selected = element.classList.contains(ClassName.SELECTED_ANSWER);
      let answerState;
      return answerState = elementIsCorrect ? selected ? AnswerSelectionState_CORRECT : AnswerSelectionState_MISSED : selected ? AnswerSelectionState_INCORRECT : AnswerSelectionState_AVOIDED, this.#showAnswerState(element, answerState), answerState === AnswerSelectionState_CORRECT || answerState === AnswerSelectionState_AVOIDED;
    }
    #showAnswerState(element, answerState) {
      let className = "";
      switch (answerState) {
        case AnswerSelectionState_AVOIDED:
          className = ClassName.AVOIDED_ANSWER;
          break;
        case AnswerSelectionState_CORRECT:
          className = ClassName.CORRECT_ANSWER;
          break;
        case AnswerSelectionState_INCORRECT:
          className = ClassName.INCORRECT_ANSWER;
          break;
        case AnswerSelectionState_MISSED:
          className = ClassName.MISSED_ANSWER;
      }
      element.classList.add(className);
    }
    handleKeydownEvent(event, eventId) {
      if (eventId !== ElementId_CLICKED_ANSWER) return super.handleKeydownEvent(event, eventId);
      switch (event.key) {
        case " ":
        case "Enter":
          this.handleClickEvent(event, eventId);
      }
    }
  }
  class FillProblemPresenter extends ProblemPresenter {
    #missingWordSelectors;
    #missingWordCorrectAnswers;
    constructor(config) {
      super(config), this.#createMissingWordSelectors(), this.answerElement.hide();
    }
    #createMissingWordSelectors() {
      const questionWordElements = this.questionElement.querySelectorAll(".missing-word");
      this.#missingWordCorrectAnswers = [], questionWordElements.forEach(element => {
        const correctAnswer = ManagedElement.getSafeAttribute(element, "data-missing-word");
        this.#missingWordCorrectAnswers.push(correctAnswer);
      });
      const redHerrings = this.problem.firstWordsOfWrongAnswers,
        options = ["...", ...this.#missingWordCorrectAnswers, ...redHerrings];
      options.sort();
      const settingDefinition = {
        defaultValue: "...",
        options: options
      };
      this.#missingWordSelectors = [], questionWordElements.forEach((element, index) => {
        const selector = new SelectControl(index, settingDefinition);
        element.appendChild(selector.element), this.#missingWordSelectors.push(selector);
      }), this.autoAddKeydownEvents(this.#missingWordSelectors);
    }
    areAnswersCorrect() {
      let correct = !0;
      return this.#missingWordSelectors.forEach((selectControl, index) => {
        const givenAnswer = selectControl.getText(),
          container = selectControl.parentElement;
        selectControl.remove(), container.textContent = givenAnswer, givenAnswer === this.#missingWordCorrectAnswers[index] ? this.#showAnswerState(container, AnswerSelectionState_CORRECT) : (this.#showAnswerState(container, AnswerSelectionState_INCORRECT), correct = !1);
      }), correct;
    }
    #showAnswerState(element, answerState) {
      let className = "";
      switch (answerState) {
        case AnswerSelectionState_AVOIDED:
          className = ClassName.AVOIDED_ANSWER;
          break;
        case AnswerSelectionState_CORRECT:
          className = ClassName.CORRECT_ANSWER;
          break;
        case AnswerSelectionState_INCORRECT:
          className = ClassName.INCORRECT_ANSWER;
          break;
        case AnswerSelectionState_MISSED:
          className = ClassName.MISSED_ANSWER;
      }
      element.classList.add(className);
    }
  }
  class OrderProblemPresenter extends ProblemPresenter {
    #missingWordSelectors;
    #missingWordCorrectAnswers;
    constructor(config) {
      super(config), this.#buildOrder();
    }
    #buildOrder() {
      this.#missingWordCorrectAnswers = this.problem.firstWordsOfRightAnswers;
      const redHerrings = this.problem.firstWordsOfWrongAnswers,
        options = ["...", ...this.#missingWordCorrectAnswers, ...redHerrings];
      options.sort();
      const settingDefinition = {
          defaultValue: "...",
          options: options
        },
        orderedAnswers = new ManagedElement("div", "problem-ordered-answers");
      this.#missingWordSelectors = [];
      for (let index = 0; index < this.problem.rightAnswers.length; index++) {
        const span = new ManagedElement("span", "missing-word"),
          selectControl = new SelectControl(index, settingDefinition);
        this.#missingWordSelectors.push(selectControl), span.appendChild(selectControl), orderedAnswers.appendChild(span);
      }
      this.answerElement.appendChild(orderedAnswers), this.autoAddKeydownEvents(this.#missingWordSelectors);
    }
    areAnswersCorrect() {
      let correct = !0;
      return this.#missingWordSelectors.forEach((selectControl, index) => {
        const givenAnswer = selectControl.getText(),
          container = selectControl.parentElement;
        selectControl.remove(), container.textContent = givenAnswer, givenAnswer === this.#missingWordCorrectAnswers[index] ? this.#showAnswerState(container, AnswerSelectionState_CORRECT) : (this.#showAnswerState(container, AnswerSelectionState_INCORRECT), correct = !1);
      }), correct;
    }
    #showAnswerState(element, answerState) {
      let className = "";
      switch (answerState) {
        case AnswerSelectionState_AVOIDED:
          className = ClassName.AVOIDED_ANSWER;
          break;
        case AnswerSelectionState_CORRECT:
          className = ClassName.CORRECT_ANSWER;
          break;
        case AnswerSelectionState_INCORRECT:
          className = ClassName.INCORRECT_ANSWER;
          break;
        case AnswerSelectionState_MISSED:
          className = ClassName.MISSED_ANSWER;
      }
      element.classList.add(className);
    }
  }
  class ReadSpeedCalculator {
    static MIN_WPM = 80;
    static MAX_WPM = 1e3;
    #secondsPerWord;
    constructor() {
      let wordsPerMinute = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 130;
      this.setWordsPerMinute(wordsPerMinute);
    }
    setWordsPerMinute(wordsPerMinute) {
      let wpm = parseInt(wordsPerMinute);
      isNaN(wpm) ? console.error(`Attempt made to set words per minute to non-numeric value of ${wordsPerMinute}`) : (wpm = Math.max(wordsPerMinute, ReadSpeedCalculator.MIN_WPM), wpm = Math.min(wpm, ReadSpeedCalculator.MAX_WPM), this.#secondsPerWord = 60 / wpm);
    }
    getSecondsToRead(data) {
      return getPlainTextFromHtml(data).trim().split(/\s+/).length * this.#secondsPerWord;
    }
  }
  class DisplayCards {
    #blocks;
    #index;
    #readSpeedCalculator;
    constructor(html) {
      this.#blocks = this.#splitHtml(html), this.#index = 0, this.#readSpeedCalculator = new ReadSpeedCalculator();
    }
    #splitHtml(html) {
      const blocks = html.split(/(<\/(?:p|div)>)/i),
        result = [],
        iterations = Math.ceil(blocks.length / 2);
      for (let index = 0; index < iterations; index++) {
        const tail = blocks[2 * index + 1] ?? "";
        result.push(`${blocks[2 * index]}${tail}`.trim());
      }
      return result.filter(e => e);
    }
    getNext() {
      if (this.#index < this.#blocks.length) {
        const html = this.#blocks[this.#index++];
        return {
          html: html,
          readTimeSecs: this.#readSpeedCalculator.getSecondsToRead(html)
        };
      }
      return null;
    }
    get hasMore() {
      return this.#index < this.#blocks.length;
    }
    reset() {
      this.#index = 0;
    }
    setWordsPerMinute(wpm) {
      this.#readSpeedCalculator.setWordsPerMinute(wpm);
    }
  }
  const MediaClass_PAUSE = "pause",
    MediaClass_PLAY = "play",
    MediaClass_SKIP = "skip",
    MediaID_PAUSE = "pause",
    MediaID_PLAY = "play",
    MediaID_SKIP = "skip",
    CardState_INACTIVE = 0,
    CardState_ARRIVING = 1,
    CardState_READING = 2,
    CardState_LEAVING = 3;
  class SlideProblemPresenter extends ProblemPresenter {
    #cards;
    #visualCard;
    #skipButton;
    #playButton;
    #pauseButton;
    #readTimerId;
    #cardState = CardState_INACTIVE;
    #currentCardDetail;
    #paused;
    constructor(config) {
      super(config), this.#buildSlideShow(), this.submitButton.hide();
    }
    #buildSlideShow() {
      this.#cards = new DisplayCards(this.problem.intro.html || this.problem.question.html), this.#visualCard = new ManagedElement("div", "display-card"), this.listenToEventOn("animationend", this.#visualCard), this.questionElement.removeChildren(), this.questionElement.appendChild(this.#visualCard), this.expandPresentation(), this.#addMediaButtons();
    }
    #addMediaButtons() {
      this.#playButton = new ManagedElement("button", MediaClass_PLAY), this.#addButtonToButtonBar(this.#playButton, icons.play, MediaID_PLAY), this.#pauseButton = new ManagedElement("button", MediaClass_PAUSE), this.#addButtonToButtonBar(this.#pauseButton, icons.pause, MediaID_PAUSE), this.#skipButton = new ManagedElement("button", MediaClass_SKIP), this.#addButtonToButtonBar(this.#skipButton, icons.skip, MediaID_SKIP);
    }
    #addButtonToButtonBar(button, icon, eventId) {
      icons.applyIconToElement(icon, button.element), this.listenToEventOn("click", button, eventId), this.addButtonToBar(button);
    }
    presentOnStage(stageElement) {
      return this.#showMediaButtons(!0), setTimeout(() => this.#showNextCard()), super.presentOnStage(stageElement);
    }
    #setCardState(cardState) {
      switch (cardState) {
        case CardState_ARRIVING:
          this.#visualCard.classList.remove("card-offscreen"), this.#visualCard.classList.add("card-onscreen");
          break;
        case CardState_LEAVING:
          this.#visualCard.classList.remove("card-onscreen"), this.#visualCard.classList.add("card-offscreen");
      }
      this.#cardState = cardState;
    }
    #showNextCard() {
      if (console.log("Show the next card"), this.#endShowIfLastCard()) return void this.handleClickEvent(new Event("click"), Presenter.NEXT_ID);
      const readingSpeed = persistentData.getFromStorage("readingSpeed", 130);
      this.#cards.setWordsPerMinute(readingSpeed), this.#currentCardDetail = this.#cards.getNext(), this.#visualCard.innerHTML = this.#currentCardDetail.html;
      const cardRect = this.#visualCard.getBoundingClientRect(),
        verticalSpace = this.presentation.getBoundingClientRect().height - cardRect.height;
      this.#visualCard.style.marginTop = verticalSpace > 0 ? `${Math.floor(verticalSpace / 2)}px` : "0px", this.#setCardState(CardState_ARRIVING), this.#endShowIfLastCard();
    }
    #readCard() {
      this.#setCardState(CardState_READING), this.#paused || (this.#readTimerId = setTimeout(() => {
        this.#removeCard();
      }, 1e3 * this.#currentCardDetail.readTimeSecs));
    }
    #removeCard() {
      this.#setCardState(CardState_LEAVING);
    }
    #endShowIfLastCard() {
      return !this.#cards.hasMore && (this.#pauseButton.hide(), this.#playButton.hide(), this.#skipButton.hide(), this.showNextButton(!0), !0);
    }
    handleClickEvent(event, eventId) {
      switch (eventId) {
        case MediaID_PAUSE:
          return clearTimeout(this.#readTimerId), this.#showMediaButtons(!1), void (this.#paused = !0);
        case MediaID_PLAY:
          return clearTimeout(this.#readTimerId), this.#showMediaButtons(!0), this.#cardState === CardState_READING && this.#removeCard(), void (this.#paused = !1);
        case MediaID_SKIP:
          return clearTimeout(this.#readTimerId), this.#showMediaButtons(!0), this.#cardState !== CardState_ARRIVING && this.#cardState !== CardState_READING || this.#removeCard(), void (this.#paused = !1);
      }
      super.handleClickEvent(event, eventId);
    }
    handleAnimationendEvent(eventIgnored, eventIdIgnored) {
      switch (this.#cardState) {
        case CardState_ARRIVING:
          this.#readCard();
          break;
        case CardState_LEAVING:
          this.#showNextCard();
          break;
        default:
          console.error(`Animation unexpectedly ended with card in state ${this.#cardState}`);
      }
    }
    #showMediaButtons(playing) {
      playing ? (this.#pauseButton.show(), this.#playButton.hide(), this.#skipButton.show(), this.#pauseButton.focus()) : (this.#pauseButton.hide(), this.#playButton.show(), this.#skipButton.hide(), this.#playButton.focus());
    }
  }
  const MedalDetails = {
    POOR: {
      upperLimit: 25,
      cssClass: "poor"
    },
    BAD: {
      upperLimit: 50,
      cssClass: "bad"
    },
    GOOD: {
      upperLimit: 75,
      cssClass: "good"
    },
    EXCELLENT: {
      upperLimit: 100,
      cssClass: "excellent"
    }
  };
  class MarksPresenter extends Presenter {
    static RETRY_LESSON_ID = "RETRY_LESSON";
    #marks;
    constructor(config) {
      super(config), this.#buildContent();
    }
    #buildContent() {
      this.#addHeadings(), this.#addAnswers(), this.#addResult(), this.#addRetryButton(), this.#adjustButtonsForOrigin();
    }
    #adjustButtonsForOrigin() {
      switch (this.config.lessonInfo.origin) {
        case LessonOrigin_SESSION:
          this.hideHomeButton(), this.applyIconToNextButton(icons.exit), this.showNextButton();
          break;
        case LessonOrigin_REMOTE:
          this.applyIconToNextButton(icons.selectLesson), this.showNextButton();
      }
    }
    #addHeadings() {
      const lessonTitle = this.config.lessonInfo.titles.lesson || this.config.lesson.metadata.getValue("TITLE", i18n`80ba26f176878a8c09fed91eec1847ac::`);
      this.presentation.createAndAppendChild("h1", null, i18n`8a7b5ed72835af8c2804d8f5047da3d3::`), this.presentation.createAndAppendChild("h2", null, lessonTitle), this.#addBookDetailsIfManaged();
    }
    #addBookDetailsIfManaged() {
      if (this.config.lessonInfo.managed) {
        let bookDetails = "<p>from:</p>";
        lessonManager.usingLocalLibrary ? bookDetails += `<span class='library-title'>${this.config.lessonInfo.titles.library}</span>` : bookDetails += `<span class='library-title'>${this.config.lessonInfo.titles.library}</span> \n        <span class='book-title'>${this.config.lessonInfo.titles.book}</span>\n        <span class='chapter-title'>${this.config.lessonInfo.titles.chapter}</span>`, this.presentation.createAndAppendChild("div", null, bookDetails);
      }
    }
    #addRetryButton() {
      const repeatButton = new ManagedElement("button");
      icons.applyIconToElement(icons.repeatLesson, repeatButton), this.addButtonToBar(repeatButton), this.listenToEventOn("click", repeatButton, MarksPresenter.RETRY_LESSON_ID);
    }
    #addAnswers() {
      const answers = new ManagedElement("ul");
      this.config.lesson.marks.markedItems.forEach(markedItem => {
        const li = new ManagedElement("li");
        li.innerHTML = `${markedItem.item.question.plainText}`, li.classList.add(this.#getClassForMarkState(markedItem.state)), answers.appendChild(li);
      }), this.presentation.appendChild(answers);
    }
    #addResult() {
      const marks = this.config.lesson.marks,
        totalQuestions = marks.correct + marks.incorrect + marks.skipped,
        percent = 0 == totalQuestions ? 0 : Math.round(100 * marks.correct / totalQuestions),
        summary = i18n`dba099f02fa6e674228bce51535a5cc4::${percent}${marks.correct}${totalQuestions}`;
      this.presentation.createAndAppendChild("p", "result-summary", summary).classList.add(this.#calcMedalClass(percent));
    }
    #calcMedalClass(percent) {
      for (const key in MedalDetails) {
        const details = MedalDetails[key];
        if (percent < details.upperLimit) return details.cssClass;
      }
      return MedalDetails.EXCELLENT.cssClass;
    }
    #getClassForMarkState(state) {
      switch (state) {
        case MarkState_CORRECT:
          return "correct";
        case MarkState_INCORRECT:
          return "incorrect";
        case MarkState_SKIPPED:
          return "skipped";
      }
      return "unknown-state";
    }
    next(eventId) {
      switch (eventId) {
        case MarksPresenter.RETRY_LESSON_ID:
          return this.config.factory.getProblemAgain(this, this.config);
        case Presenter.NEXT_ID:
          if (this.config.lessonInfo.origin === LessonOrigin_SESSION) return sessionStorage.clear(), void window.top.location.replace(window.location.href);
      }
      return super.next(eventId);
    }
  }
  const NAVIGATION = {
    HomePresenter: {
      previous: null,
      next: LibraryPresenter
    },
    LibraryPresenter: {
      previous: HomePresenter,
      next: BookPresenter
    },
    BookPresenter: {
      previous: LibraryPresenter,
      next: ChapterPresenter
    },
    ChapterPresenter: {
      previous: BookPresenter,
      next: LessonPresenter
    },
    LessonPresenter: {
      previous: ChapterPresenter,
      next: ProblemPresenter
    },
    LessonEditorPresenter: {
      previous: LessonPresenter,
      next: LessonPresenter
    },
    ProblemPresenter: {
      previous: null,
      next: ProblemPresenter
    },
    ChoiceProblemPresenter: {
      previous: null,
      next: ProblemPresenter
    },
    FillProblemPresenter: {
      previous: null,
      next: ProblemPresenter
    },
    OrderProblemPresenter: {
      previous: null,
      next: ProblemPresenter
    },
    SlideProblemPresenter: {
      previous: null,
      next: ProblemPresenter
    },
    MarksPresenter: {
      previous: null,
      next: ChapterPresenter
    }
  };
  class PresenterFactory {
    getSuitableProblemPresenter(config) {
      switch (config.lesson.peekAtNextProblem().questionType) {
        case QuestionType_ORDER:
          return new OrderProblemPresenter(config);
        case QuestionType_FILL:
          return new FillProblemPresenter(config);
        case QuestionType_MULTI:
        case QuestionType_SIMPLE:
          return new ChoiceProblemPresenter(config);
        default:
          return new SlideProblemPresenter(config);
      }
    }
    hasNext(caller) {
      return !!NAVIGATION[caller.constructor.name].next;
    }
    hasPrevious(caller) {
      return !!NAVIGATION[caller.constructor.name].previous;
    }
    getHome(config) {
      return new HomePresenter(config);
    }
    getEditor(caller, config) {
      return caller instanceof LessonPresenter ? new LessonEditorPresenter(config) : (console.error("Attempt to edit a presenter for which there is no editor. Going home."), new HomePresenter(config));
    }
    getNext(caller, config) {
      if (caller instanceof ProblemPresenter || caller instanceof LessonPresenter) return config.lesson.hasMoreProblems ? this.getSuitableProblemPresenter(config) : new MarksPresenter(config);
      {
        const klass = this.#skipUnnecessaryListPresenters(NAVIGATION[caller.constructor.name].next);
        return klass ? new klass(config) : null;
      }
    }
    getPrevious(caller, config) {
      const klass = NAVIGATION[caller.constructor.name].previous;
      return klass ? new klass(config) : null;
    }
    getProblemAgain(caller, config) {
      return caller instanceof MarksPresenter ? (config.lesson.restart(), config.lesson.hasMoreProblems ? this.getSuitableProblemPresenter(config) : new MarksPresenter(config)) : (console.error("Attempt to retry problem from other than a MarksPresenter."), this.getHome(config));
    }
    #skipUnnecessaryListPresenters(presenterClass) {
      for (;;) {
        const nextClass = this.#moveToNextPresenterIfUnnecessary(presenterClass);
        if (nextClass === presenterClass) return presenterClass;
        presenterClass = nextClass;
      }
    }
    #moveToNextPresenterIfUnnecessary(presenterClass) {
      switch (presenterClass.name) {
        case "LibraryPresenter":
          if (lessonManager.bookTitles.length <= 1) return lessonManager.bookIndex = 0, BookPresenter;
          break;
        case "BookPresenter":
          if (lessonManager.chapterTitles.length <= 1) return lessonManager.chapterIndex = 0, ChapterPresenter;
          break;
        case "ChapterPresenter":
          if (lessonManager.lessonTitles.length <= 1) return lessonManager.lessonIndex = 0, LessonPresenter;
      }
      return presenterClass;
    }
    static getInitial() {
      const config = {
        factory: new PresenterFactory()
      };
      return sessionLesson.hasLesson ? (config.lesson = sessionLesson.lesson, config.lessonInfo = sessionLesson.lessonInfo, config.lesson.hasMoreProblems ? config.factory.getSuitableProblemPresenter(config) : new MarksPresenter(config)) : new HomePresenter(config);
    }
  }
  class HelpButton extends ManagedElement {
    constructor() {
      super("button", "help-button"), this.classList.add("icon-only-button"), icons.applyIconToElement(icons.help, this, {
        hideText: !0
      }), this.listenToOwnEvent("click", "HELP");
    }
    handleClickEvent(eventIgnored, eventIdIgnored) {
      const presenter = document.querySelector(".Presenter");
      console.debug(`Help triggered from ${presenter?.className}`), window.open(Urls.HELP, "_blank");
    }
    static createInside(container) {
      const button = new HelpButton(container);
      return button.appendTo(container), button;
    }
  }
  class Menu extends ManagedElement {
    #menuContent;
    #menuItems;
    constructor() {
      super("button"), this.setAttribute("aria-haspopup", !0), icons.applyIconToElement(icons.openMenu, this, {
        hideText: !0
      }), this.classList.add("utils-menu-icon-open", "icon-only-button"), this.#createMenuContentHtml(), this.#menuItems = new MenuItems();
    }
    #createMenuContentHtml() {
      const menuTitleBar = new ManagedElement("div");
      menuTitleBar.classList.add("utils-menu-title"), this.#menuContent = new ManagedElement("div", "utils-menu-content"), this.#menuContent.style.visibility = "hidden", document.body.insertBefore(this.#menuContent.element, document.getElementById("modal-mask").nextSibling);
      const menuItemsElement = new ManagedElement("div");
      menuItemsElement.classList.add("container", "utils-menu-items"), menuItemsElement.setAttribute("aria-role", "menu"), this.#menuContent.appendChild(menuTitleBar), this.#menuContent.appendChild(menuItemsElement), this.listenToOwnEvent("click", "OPEN"), this.listenToEventOn("click", this.#menuContent, "CONTENT-ACTION"), this.listenToEventOn("keydown", this.#menuContent, "CONTENT-ACTION");
    }
    setMenuItems(items) {
      this.#menuItems.setMenuItems(items);
    }
    #showMenuItems() {
      showMask(), this.style.visibility = "hidden", this.#menuContent.classList.add("modal"), this.#menuContent.style.visibility = "visible", this.#menuContent.style.transform = "translateX(0)", this.#menuContent.querySelector("button.utils-menu-item").focus();
    }
    #hideMenuItems() {
      hideMask(), this.style.visibility = "visible", this.#menuContent.style.transform = "translateX(-100%)", this.#menuContent.style.visibility = "hidden", this.#menuContent.classList.remove("modal"), focusManager.findBestFocus();
    }
    handleClickEvent(eventIgnored, eventId) {
      if ("OPEN" === eventId) this.#showMenuItems();else this.#hideMenuItems();
    }
    handleKeydownEvent(event, eventIdIgnored) {
      "Escape" === event.key && this.#hideMenuItems();
    }
  }
  class MenuItem extends ManagedElement {
    constructor(iconDetails) {
      super("button", "utils-menu-item"), icons.applyIconToElement(iconDetails, this), this.setAttributes({
        "aria-role": "menuitem"
      });
    }
  }
  class MenuItems extends ManagedElement {
    static CLOSE_EVENT_ID = "close";
    #navigator;
    #menuIconClose;
    constructor() {
      const parent = document.querySelector(".utils-menu-items");
      if (!parent) throw "Html structure not in place. createMenuHtml should have been called.";
      super(parent), this.setAttributes({
        "aria-role": "menu"
      }), this.menuDefinition = null, this.#menuIconClose = new ManagedElement("button"), icons.applyIconToElement(icons.closeMenu, this.#menuIconClose, {
        hideText: !0
      }), this.#menuIconClose.classList.add("utils-menu-icon-close", "icon-only-button"), document.querySelector(".utils-menu-title").appendChild(this.#menuIconClose.element), this.listenToEventOn("click", this.#menuIconClose, MenuItems.CLOSE_EVENT_ID);
    }
    setMenuItems(menuDefinition) {
      this.menuDefinition && this.remove(), this.menuDefinition = menuDefinition;
      const commandItems = [this.#menuIconClose];
      this.menuDefinition.forEach((menuDef, index) => {
        let item;
        menuDef.command ? (item = new MenuItem(menuDef.iconDetails), this.listenToEventOn("click", item, index), this.listenToEventOn("keydown", item, index), commandItems.push(item)) : item = new ManagedElement("hr"), this.appendChild(item), this.#navigator = new ArrayIndexer(commandItems);
      });
    }
    handleClickEvent(event, eventId) {
      const index = parseInt(eventId);
      isNaN(index) || (console.debug(`Handling event ${event.type} with id ${eventId}`), this.menuDefinition[index].command.execute().then(value => {
        console.debug(`Finished handling menu option ${value}.`);
      }));
    }
  }
  function setTitleBarAndFooter(menuItems) {
    !function (menuItems) {
      const titleElement = document.getElementById("title-bar");
      if (!titleElement) return void console.error('Cannot find element with id of "title-bar".');
      if (titleElement.children?.length > 0) return void console.error("Second attempt made to setup title bar ignored.");
      const headerTextContainer = document.createElement("span");
      headerTextContainer.innerHTML = i18n`53e5c9dd7146d4e290db1b2bdc2c0daf::`;
      const helpButtonContainer = document.createElement("span");
      HelpButton.createInside(helpButtonContainer);
      const menu = new Menu();
      menu.setMenuItems(menuItems), titleElement.appendChild(menu.element), titleElement.appendChild(headerTextContainer), titleElement.appendChild(helpButtonContainer);
    }(menuItems), function () {
      const footerElement = document.getElementById("footer");
      if (!footerElement) return void console.error('Cannot find element with id of "footer".');
      if (footerElement.children?.length > 0) return void console.error("Second attempt made to setup footer ignored.");
      const footerTextContainer = document.createElement("span"),
        devTag = "PRODUCTION" !== BuildInfo.getMode().toUpperCase() ? `[${BuildInfo.getMode()}]` : "";
      footerTextContainer.innerHTML = `${BuildInfo.getBundleName()} ${BuildInfo.getVersion()}${devTag} ${BuildInfo.getBuildDate()}`, footerElement.appendChild(footerTextContainer);
    }();
  }
  let throttleTimer = null;
  function setVhCssVariable() {
    const vh = .01 * window.innerHeight;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }
  window.addEventListener("resize", () => {
    null === throttleTimer && (throttleTimer = window.setTimeout(() => {
      throttleTimer = null, setVhCssVariable();
    }, 1e3));
  }), setVhCssVariable(), BuildInfo.isBuilt() && "production" === BuildInfo.getMode() && "serviceWorker" in navigator && window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").then(registration => {
      console.info("SW registered: ", registration);
      let controller = navigator.serviceWorker.controller;
      console.info(`Page controlled by ${controller}.`);
    }).catch(registrationError => {
      console.error("SW registration failed: ", registrationError);
    });
  }), window.addEventListener("load", () => (persistentData.setStorageKeyPrefix(`LR_${BuildInfo.getBundleName().replace(".", "_")}`), (BuildInfo.isBuilt() ? resolveLanguages("./languages.json").then(() => {
    console.info(`Build information: ${BuildInfo.getBundleName} ${BuildInfo.getVersion()} ${BuildInfo.getMode()}`);
  }).catch(error => {
    const fetchSummary = error.fetchSummary;
    if (!(fetchSummary && fetchSummary.length > 0 && fetchSummary[0].read)) return console.error(error.message), Promise.reject(error);
    console.error(`${error}\nUsing translation ${fetchSummary[0].url}`);
  }) : Promise.resolve(void 0)).then(() => lessonManager.loadAllLibraries("assets/lessons/libraries.json")).then(() => loadSettingDefinitions({
    palette: {
      type: "separator",
      label: i18n`54016c9d89a98aa8bf2e8a8e7ba6f352::`
    },
    hue: {
      type: "range",
      label: i18n`d86cbd21656e6a16eeebdf3041f7d9b0::`,
      defaultValue: DEFAULT_HUE,
      min: 0,
      max: 360,
      onupdate: value => {
        setPalette({
          hue: value = parseInt(value)
        });
      }
    },
    saturation: {
      type: "range",
      label: i18n`0b0d1a40638f299b733e0c7c90344698::`,
      defaultValue: DEFAULT_SATURATION,
      min: 0,
      max: 100,
      onupdate: value => {
        setPalette({
          saturation: value = parseInt(value)
        });
      }
    },
    spread: {
      type: "range",
      label: i18n`c13970d8379e2f9daef71a2d63e2233d::`,
      defaultValue: DEFAULT_COLOR_SPREAD,
      min: 0,
      max: 180,
      onupdate: value => {
        setPalette({
          spread: value = parseInt(value)
        });
      }
    },
    darkMode: {
      type: "checkbox",
      label: i18n`3924c958175e666737225e86a68ac4b4::`,
      defaultValue: DEFAULT_DARK_MODE,
      onupdate: value => {
        setPalette({
          dark: value
        });
      }
    },
    fontSize: {
      type: "range",
      label: i18n`c4943062b634c56348c67fdebba808eb::`,
      defaultValue: 15,
      min: 10,
      max: 22,
      onupdate: value => {
        setProperty("--font-base-size", `${value}px`);
      }
    },
    readingSpeed: {
      type: "range",
      label: i18n`23944ac1bff1399fe70064067e3e4804::`,
      defaultValue: "180",
      min: 80,
      max: 1e3
    },
    lessonInfo: {
      type: "separator",
      label: i18n`16c6a433b76133c6204c165f24374006::`
    },
    library: {
      type: "select",
      label: i18n`b0ef546d26b0e0a6ad6a89b8f81b9170::`,
      defaultValue: "EN",
      onupdate: value => {
        lessonManager.remoteLibraryKey = value;
      },
      options: () => lessonManager.remoteLibraryTitles,
      reloadIfChanged: !0
    }
  })).then(() => {
    const language = i18n`language::`;
    return "" !== language && (console.info(`Language ${language}`), document.documentElement.setAttribute("lang", language)), !0;
  }).then(() => setTitleBarAndFooter(getMainMenuItems())).then(() => lessonManager.loadAllLibraryContent()).then(() => {
    const stage = document.getElementById("stage");
    return new StageManager(stage).startShow(PresenterFactory.getInitial());
  }).then(() => {
    console.warn("Did not expect to get here."), ModalDialog.showInfo(i18n`c55bdbb47fee32f4ca56a977427374bf::`).then(() => window.location.reload());
  }).catch(error => {
    console.error(error), ModalDialog.showFatal(error).then(() => window.location.reload());
  })));
}();