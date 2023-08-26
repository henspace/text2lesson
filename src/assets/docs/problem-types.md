---
title: Problem types
---

_Text2Lesson_ supports five problem types. The type is automatically derived
from the way the problem is defined:

- **simple**: a multiple choice question with just one correct answer.
- **multi**: a multiple choice question where the user can select more than one
  correct answer.
- **fill**: a 'fill in the blank' question. Users have a selection of words which
  they must select to complete missing words in the question.
- **order**: a 'put the answers in the correct order' question. Users have a
  selection of words which they must select in the correct order.
- **slideshow**: there is no question to answer. The introduction element is
  used to create a simple slideshow.

# Creation of different types

The application automatically determines the problem type using the following
rules.

1. If the problem only contains a introduction element, a
   [Slideshow problem](#slideshow-problem) is generated.
1. If the question contains [Missing Words](#missing-words) a
   [Fill Problem](#fill-problem) is generated.
1. If the question contains just one missing word at the end and with no definition
   of the missing word, an [Order problem](#order-problem) is generated.
1. If the problem contains a question with just one right answer defined, a
   [Simple problem](#simple-problem) is generated.
1. If the problem contains a question with more than one right answer defined,
   a [Multi problem](#multi-problem) is generated.

## Missing words

Missing words are defined by adding three points followed by the word that
should be regarded as missing. So `...REMOVE` would not display the word
`REMOVE` but instead would leave a gap. This is used for questions where the user
must select the missing word from a number of options.

# Slideshow problem

This is a simple presentation of information element. The text is automatically
broken up into slides which are then presented to the user.

# Simple problem

This is a traditional multiple choice question where users are allowed to select
just one answer. Here is an example:

```
(?) What is the capital of France?
= Paris
x London
x Berlin
```

Note that the possible answers are automatically shuffled when the problem is
presented.

## Multi problem

This is a traditional multiple choice question where users should select more
than one answer. Here is an example

```
(?) Which of these animals can be found in Africa?
= Zebra
= Lion
x Tiger
x Kangeroo
```

Note that the possible answers are automatically shuffled when the problem is
presented.

## Fill problem

This is a special problem where the question is displayed with a number of
missing words. Where the words have been removed, the user has to select the
correct word from a list of options.

The options are generated from the original missing word and the wrong answer
elements. Any right answer elements defined in the problem are ignored.
The right answer for each missing word is taken from the definition of
the missing word. Here is an example question:

```
(?)Mount ...Everest is higher than mount ...K2 which is higher than mount ...Tetnuldi
x Snowdon
```

Missing words can only be single words. If you create a wrong answer element
with more than one word, only the first word will be used.

Note that the possible answers are automatically shuffled when the problem is
presented.

## Order problem

This is a special problem where the question is displayed followed by a number
of missing words. For each missing word, the user has to select the correct word
from a list of options.

The options are generated from the right and wrong answer elements. The right
answer for each missing word is taken from the order in which
the right answers were defined. Here is an example question:

```
(?)Put the even numbers in ascending order ...
= two
= four
= six
x one
x three
x five
```

Missing words can only be single words. If you create a wrong answer element
with more than one word, only the first word will be used.

Note that the possible answers are automatically shuffled when the problem is
presented.

[Home](./about.md)
