export default {
  name: 'LiveBot (discord.js)',
  language: 'javascript',
  generateFrom(data) {
    if (data.embed && data.content) {
      return (
        `const embed = ${JSON.stringify(data.embed, null, '  ')};\n` +
        `selectedChan.send(${JSON.stringify(data.content)}, { embed });`
      );
    } else if (data.embed) {
      return `const embed = ${JSON.stringify(data.embed, null, '  ')};\nselectedChan.send({ embed });`;
    }

    return `selectedChan.send(${JSON.stringify(data.content)})`;
  }
};
