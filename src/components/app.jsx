import React from 'react';
import { SketchPicker } from 'react-color';

import Button from './button';
import ModalContainer from './modalcontainer';
import AboutModal from './aboutmodal';
import CodeModal from './codemodal';
import CodeMirror from './codemirror';
import DiscordView from './discordview';

import Ajv from 'ajv';
import {
  botMessageSchema,
  webhookMessageSchema,
  registerKeywords,
  stringifyErrors,
} from '../validation';

import {
  extractRGB,
  combineRGB,
} from '../color';


const ajv = registerKeywords(new Ajv({ allErrors: true }));
const validators = {
  regular: ajv.compile(botMessageSchema),
  webhook: ajv.compile(webhookMessageSchema),
};

function FooterButton(props) {
  return <Button {...props} className='shadow-1 shadow-hover-2 shadow-up-hover' />;
}

const initialContent = 'this `supports` __a__ **subset** *of* ~~markdown~~ 😃 ```js\nfunction foo(bar) {\n  console.log(bar);\n}\n\nfoo(1);```';
const initialColor = 1;
const initialEmbed = {
  title: 'title ~~(did you know you can have markdown here too?)~~',
  description: 'this supports [named links](https://discordapp.com) on top of the previously shown subset of markdown. ```\nyes, even code blocks```',
  url: 'https://github.com/yesBad/embed-visualizer',
  color: initialColor,
  timestamp: new Date().toISOString(),
  footer: { icon_url: 'https://cdn.discordapp.com/icons/789536411204190299/6ce9f268e544809ff413c11c8b71ef8a.png', text: 'footer text' },
  thumbnail: { url: 'https://cdn.discordapp.com/icons/789536411204190299/6ce9f268e544809ff413c11c8b71ef8a.png' },
  image: { url: 'https://cdn.discordapp.com/icons/789536411204190299/6ce9f268e544809ff413c11c8b71ef8a.png' },
  author: {
    name: 'Leovoel <3',
    url: 'https://github.com/leovoel/embed-visualizer',
    icon_url: 'https://avatars.githubusercontent.com/u/11607580'
  },
  fields: [
    { name: '🤔', value: 'this is specially modified for LiveBots eval function' },
    { name: '😱', value: 'so you can send cool embeds easily!' },
    { name: '🙄', value: 'what is livebot you ask? oh its just the best thing ever! https://github.com/SebOuellette/LiveBot' },
    { name: '<:thonkang:219069250692841473>', value: 'so yeah', inline: true },
    { name: '<:thonkang:219069250692841473>', value: 'dope :D', inline: true }
  ]
};

// this is just for convenience.
// TODO: vary this more?
const initialCode = JSON.stringify({
  content: initialContent,
  embed: initialEmbed
}, null, '  ');

const App = React.createClass({
  // TODO: serialize input, webhookMode, compactMode and darkTheme to query string?

  getInitialState() {
    return {
      webhookMode: false,
      compactMode: false,
      darkTheme: true,
      currentModal: null,
      input: initialCode,
      data: {},
      error: null,
      colorPickerShowing: false,
      embedColor: extractRGB(initialColor),

      // TODO: put in local storage?
      webhookExampleWasShown: false,
    };
  },

  validateInput(input, webhookMode) {
    const validator = webhookMode ? validators.webhook : validators.regular;

    let parsed;
    let isValid = false;
    let error = '';

    try {
      parsed = JSON.parse(input);
      isValid = validator(parsed);
      if (!isValid) {
        error = stringifyErrors(parsed, validator.errors);
      }
    } catch (e) {
      error = e.message;
    }

    let data = isValid ? parsed : this.state.data;

    let embedColor = { r: 0, g: 0, b: 0 };
    if (webhookMode && isValid && data.embeds && data.embeds[0]) {
      embedColor = extractRGB(data.embeds[0].color);
    } else if (!webhookMode && isValid && data.embed) {
      embedColor = extractRGB(data.embed.color);
    }

    // we set all these here to avoid some re-renders.
    // maybe it's okay (and if we ever want to
    // debounce validation, we need to take some of these out)
    // but for now that's what we do.
    this.setState({ input, data, error, webhookMode, embedColor });
  },

  componentWillMount() {
    this.validateInput(this.state.input, this.state.webhookMode);
  },

  onCodeChange(value, change) {
    // for some reason this fires without the value changing...?
    if (value !== this.state.input) {
      this.validateInput(value, this.state.webhookMode);
    }
  },

  openAboutModal() {
    this.setState({ currentModal: AboutModal });
  },

  openCodeModal() {
    this.setState({ currentModal: CodeModal });
  },

  closeModal() {
    this.setState({ currentModal: null });
  },

  toggleCompactMode() {
    this.setState({ compactMode: !this.state.compactMode });
  },
  
  openColorPicker() {
    this.setState({ colorPickerShowing: !this.state.colorPickerShowing });
  },
  
  colorChange(color) {
    let val = combineRGB(color.rgb.r, color.rgb.g, color.rgb.b);
    if (val === 0) val = 1; // discord wont accept 0
    const input = this.state.input.replace(/"color"\s*:\s*([0-9]+)/, '"color": ' + val);
    this.validateInput(input, this.state.webhookMode);
  },

  render() {
    const compactModeLabel = `${this.state.compactMode ? 'Cozy' : 'Compact'} mode`;
    const colorPickerLabel = `${!this.state.colorPickerShowing ? 'Open' : 'Close'} embed color picker`;

    const colorPicker = this.state.colorPickerShowing ? (
      <div style={{
        position: 'absolute',
        bottom: '45px',
        marginLeft: '-25px',
      }}>
        <SketchPicker
          color={this.state.embedColor}
          onChange={this.colorChange}
          disableAlpha={true}
        />
      </div>
    ) : null;
    
    return (
      <main className='vh-100-l bg-blurple open-sans'>

        <div className='h-100 flex flex-column'>
          <section className='flex-l flex-auto'>
            <div className='vh-100 h-auto-l w-100 w-50-l pa4 pr3-l pb0-l'>
              <CodeMirror
                onChange={this.onCodeChange}
                value={this.state.input}
                theme={this.state.darkTheme ? 'one-dark' : 'default'}
              />
            </div>
            <div className='vh-100 h-auto-l w-100 w-50-l pa4 pl3-l pb0'>
              <DiscordView
                data={this.state.data}
                error={this.state.error}
                webhookMode={this.state.webhookMode}
                darkTheme={this.state.darkTheme}
                compactMode={this.state.compactMode}
              />
            </div>
          </section>

          <footer className='w-100 pa3 tc white'>
            <FooterButton label='Generate code' onClick={this.openCodeModal} />
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <FooterButton label={colorPickerLabel} onClick={this.openColorPicker} />
              {colorPicker}
            </div>
            <FooterButton label={compactModeLabel} onClick={this.toggleCompactMode} />
            <FooterButton label='About' onClick={this.openAboutModal} />
          </footer>
        </div>

        <ModalContainer
          yes={this.displayWebhookExample}
          no={this.dismissWebhookExample}
          close={this.closeModal}
          data={this.state.data}
          webhookMode={this.state.webhookMode}
          darkTheme={this.state.darkTheme}
          hasError={this.state.error !== null && this.state.error !== ''}
          currentModal={this.state.currentModal}
        />
      </main>
    );
  },
});


export default App;
