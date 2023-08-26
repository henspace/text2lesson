# Lesson format

All lessons are created using plain text files.

Lessons are written using a very simple, intuitive format. Before we look at how
to write a lesson, we need to understand the basic structure.

- Each lesson comprises a number of _problems_.
- Each _problem_ comprises a number of _elements_.

Before the problems, the file can contain meta data for the lesson. Any lines
which precede the first problem are automatically assumed to form the meta data.
The _metadata_ is an advanced feature, so we'll ignore that for the moment.

## The basic problem elements

The different problem _elements_ are identified by a lines which start with an
_element&nbsp;identifier_. Any other characters following the identifier form
part of the data for the _element_.

The _element&nbsp;identifiers_ are as follows:

- **i**: Introduction. This is information displayed at the beginning of the
  problem.
- **?**: Question. This is the question that is to be asked.
- **=**: Right answer. This is the correct answer to the question.
- **x**: Wrong answer. This is a wrong answere for the question.
- **&**: Explanation. This is text that can be displayed once the question has
  been answered.
- **\_**: Separator. This is used to separate questions.

So here is the text that could be used for a simple question.

```
i I am going to test your knowledge of European cities.
? What is the capital of France?
= Paris
x London
x Berlin
x Amsterdam
x Prague
& Paris is the capital of France.
```

Text2Lesson allows you to enclose the _element&nbsp;identifier_ in brackets, so
the following would also work.

```
(i) I am going to test your knowledge of European cities.
(?) What is the capital of France?
(=) Paris
(x) London
(x) Berlin
(x) Amsterdam
(x) Prague
(&) Paris is the capital of France.
```

You don't need to use the brackets, but you might find it clearer for the
introduction _element&nbsp;identifier_. It's up to you.

To add more flexibility, you can repeat the brackets and
_element&nbsp;identifier_ as many times as you like. So this is also valid.

```
(i) I am going to test your knowledge of European cities.
? What is the capital of France?
((((((=)))))) Paris
((xxxxxxxxxx)) London
(x) Berlin
(x) Amsterdam
(x) Prague
(&) Paris is the capital of France.
```

As a final bit of flexibility, you can precede the _element&nbsp;indentifier_ or
its enclosing bracket, by a minus sign, hash, underscore, asterisk or space,
repeated up to three times. So this is also valid:

```
# (i) I am going to test your knowledge of European cities.
## ? What is the capital of France?
* = Paris
* x London
* x Berlin
* x Amsterdam
* x Prague
* & Paris is the capital of France.
```

But why would I want to do that?

Text2Lesson allows you to use a simplified version of Markdown. This allows you
to include fancy formatting by just using plain text. So when you create lessons
you can include some formatting to improve the look of your lessons. If you do
this, you might use an online Markdown editor. If you do, you might also find
those leading characters shown above, make your lesson easier to visualise.

If you're familiar with Markdown, this probably all makes sense. If you're not,
don't worry about it for now. It's an advanced feature that you don't need to
know about to get started. If you're interested and want to know more, check out
[Markdown light](./markdown-light.md).

## Multiple lines

In the examples above, the text for each element has been included on the same
line as the _element&nbsp;identifier_, but this is not necessary. You can
include multiple lines for each element and they will automatically be joined
together. So you could write:

```
(i)
Hi!
Today I 'm going to test your knowledge of European cities.
? What is the capital of France?
= Paris
x London
x Berlin
x Amsterdam
x Prague
& Paris is the capital of France.
```

## Separating problems

Each problem must contain either an introduction or question element. It can of
course contain both.

_Text2Lesson_ uses the following rules to detects new problem :

1. A new introduction element is identified. As a problem can only contain one
   introduction element, the application knows that another introduction must be
   the start of a new problem.
1. A new question element is identified. As a problem can only contain one
   question element, the application knows that another question must be the
   start of a new problem.
1. A separator element is identified. Separators alway indicate the start of a
   new problem.

The separator is important if the automatic problem separation is not
sufficient. Consider the following lesson:

```
(i) Hello! Welcome to my lesson.
(?) What is 1 + 3?
= 4
x 5
x 6

(?) What is 3 - 1?
= 2
x 1
x 4
```

In this case, as the first problem already contains a question, the second
question automatically starts a new problem. But now consider this:

```
(i) Hello! Welcome to my lesson.

(?) What is 3 - 1?
= 2
x 1
x 4
```

As it stands, this will create one problem. But imagine if we wanted to show the
introduction as one problem and the question as a second problem; how could we
do that? Just add a separator like this:

```
(i) Hello! Welcome to my lesson.
_______________________________
(?) What is 3 - 1?
= 2
x 1
x 4
```

The separator, which uses the underscore _element&nbsp;identifier_, will tell
_Text2Lesson_ to create two problems.

You might be wondering why it might be important to have an introduction on its
own. That is because of the different problem types supported by the
application. Perhaps now is the time to check out
[Problem Types](./problem-types.md)
