import React from 'react';
import Modal from './modal';
import SimpleMarkdown from 'simple-markdown';

const aboutText = `
-= Visualizer and validator for LiveBot Eval Embeds =-

----------------------------------------------------------------

Its primary purpose is mostly just previewing and generating code for sending embeds via LiveBot's Eval.

This tool is not officially part of Discord nor LiveBot.
It makes use of some assets derived/extracted from Discord. This is
done for the sake of more helpful visuals, and not to infringe on their copyright.

The source code is available on [GitHub](https://github.com/yesbad/embed-visualizer), under the MIT license.


### HOW TO USE?:

-----------------------------

On the left of your screen you see the "code" of the embed, you edit it to your liking
and after you've edited it as you want it you can follow the GIF below on how to paste the embed in LiveBot!
![GIF](http://your-mom.is-having.fun/d40upjeirrqs.gif)


### ORIGINAL SOURCES:

-----------------------------

- Author: https://github.com/leovoel
- Github Repo: https://github.com/leovoel/embed-visualizer
`;

const rules = {
  ...SimpleMarkdown.defaultRules,

  center: {
    // really naive but we'll be ok
    match: SimpleMarkdown.blockRegex(/^-= (.*?) =-/),
    order: SimpleMarkdown.defaultRules.paragraph.order,

    parse(capture, recurseParse, state) {
      return { content: SimpleMarkdown.parseInline(recurseParse, capture[1], state) };
    },

    react(node, recurseOutput, state) {
      return <div key={state.key} className='db b f3 mv2 tc'>{recurseOutput(node.content, state)}</div>;
    }
  },

  paragraph: {
    ...SimpleMarkdown.defaultRules.paragraph,
    react(node, recurseOutput, state) {
      return <p key={state.key}>{recurseOutput(node.content, state)}</p>;
    },
  },

  link: {
    ...SimpleMarkdown.defaultRules.link,
    react(node, recurseOutput, state) {
      return (
        <a
          className='link blurple underline-hover'
          href={SimpleMarkdown.sanitizeUrl(node.target)}
          title={node.title}
          key={state.key}
          target='_blank'
        >
          {recurseOutput(node.content, state)}
        </a>
      );
    },
  },

  list: {
    ...SimpleMarkdown.defaultRules.list,
    react(node, recurseOutput, state) {
      return React.createElement(
        node.ordered ? 'ol' : 'ul',
        {
          start: node.start,
          key: state.key,
          className: 'mb4 pl4',
          children: node.items.map((item, i) => {
            return <li key={i}>{recurseOutput(item, state)}</li>;
          })
        }
      );
    },
  },

  hr: {
    ...SimpleMarkdown.defaultRules.hr,
    react(node, recurseOutput, state) {
      return <hr className='b--solid b--light-gray ma0' key={state.key} />;
    }
  },
};

const parser = SimpleMarkdown.parserFor(rules);
const renderer = SimpleMarkdown.reactFor(SimpleMarkdown.ruleOutput(rules, 'react'));

const renderAboutText = (input) => {
  input += '\n\n';
  return renderer(parser(input, { inline: false }));
};

const AboutModal = (props) => {
  return (
    <Modal title='About' maxWidth='80ch' maxHeight='90%' {...props}>
      <div className='ma3 nested-copy-seperator nested-copy-line-height'>
        {renderAboutText(aboutText)}
      </div>
    </Modal>
  );
};


export default AboutModal;
