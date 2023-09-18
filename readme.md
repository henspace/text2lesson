# Text2Lesson

This application has been designed to take plain text and convert it into
lessons. In this context, a lesson contains information about a particular
topic, interspersed with quizzes.

The application has been written to maximise user privacy, so everything runs
client side. No quiz results or user-created lessons are stored on the server.

So what's the point? There are three ways it's envisaged the application will be
used:

- to run any of the lessons included in the prebuilt library.
- to run lessons created for users' personal use; this might be for revision
  purposes.
- to create lessons to share with students, quickly and simply, and without the
  need for students to create accounts or provide any personal information.

# Licenses

The main application is licensed under the GPL-3.0 License. See
[LICENSE](./LICENSE) for details.

Additional components are distributed under separate licenses. See below for
details:

- **Service worker**: the service worker used by _Text2Lesson_ is generated
  using the  
  [GoogleChrome/workbox project](https://github.com/GoogleChrome/workbox). The
  generated service worker, _sw.js_, is released under the terms and conditions
  of the
  [Apache License version 2](https://www.apache.org/licenses/LICENSE-2.0.txt).
- **Font Awesome Free icons**: the
  [Font Awesome Free Icons](https://fontawesome.com/) are used under the terms
  and conditions of the
  [Font Awesome Free License](https://fontawesome.com/license/free) (Icons: CC
  BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License).
- **mathml.css**: the mathml.css file is based on the
  [mathml.css](https://github.com/fred-wang/mathml.css). This is used under the
  terms of the [Mozilla Public License, v. 2.0](http://mozilla.org/MPL/2.0/).
  The original code has been modified to include the `div .mathml-fallback-test`
  selector.
