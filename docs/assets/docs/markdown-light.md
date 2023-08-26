---
title: "Markdown light"
---

[Markdown](https://daringfireball.net/projects/markdown/) is a plain text
language that allows you add formatting to text, such as showing words in bold
text. _Text2Lesson_ allows some Markdown features to be included when writing
problems; however, not all features of Markdown are available.

# Limitations

The following limitations apply:

- Blockquotes: lazy blockquotes are not supported. Each line must be preceded by
  the `>` character. In addtion, nested blockquotes are not supported.
- Lists: only simple lists are supported. Blockquotes, code blocks and other
  block elements cannot be included.
- HTML: inline HTML is not supported. With the exception of HTML entities and
  '<br>', all HTML is escaped. Entities such as `&copy;` and `<br>` will not be
  escaped.
- Reference links: these are not supported.
- Automatic links: automatic links are supported but with caveat below.

## Unexpected automatic link behaviour

Automatic links in Markdown are created by enclosing the link between `<` and
`>` characters. As a byproduct of the fact that, unlike Markdown,
_Text2Lesson_ escapes all HTML, if you were to enclose text between `&lt;` and
`>` text, that would also be interpreted as an automatic link. You can prevent
this by using `&gt;` for the closing greater than character. This behaviour is
summarised below:

- `<https://henspace.com>` creates an automatic link.
- `&lt;https://henspace.com>` also creates an automatic link.
- `&lt;https://henspace.com&gt;` does not create an automatic link.

[Home](about.md)
