const nlp = require('compromise');
const capitalize = require('./capitalize');


// Filter the bad results, that include emoji, broken sentences, or links
function filterBandName(name) {
  let pass = true;
  // - anything that contains `<`
  if (name.indexOf('<') !== -1) pass = false;
  // - anything that contains `:` in the middle
  if (name.slice(1, -1).indexOf(':') !== -1) pass = false;
  // - anything that contains `,` in the middle
  if (name.slice(1, -1).indexOf(',') !== -1) pass = false;
  // TODO - anything that contains `…` in the middle
  return pass;
}

// Sanitize band names to improve readability
function sanitizeBandName(name) {
  // - if bandname ends with comma, remove comma
  if (name.slice(-1) === ',') name = name.slice(0, -1);
  // - if bandname ends with period, remove period
  if (name.slice(-1) === '.') name = name.slice(0, -1);
  return name;
}

// adv + adj + noun
function threeWordAdvAdjNoun(sent, tags) {
  const arrBandNames = [];
  let nounIndexes = [];
  tags.forEach((tag, index) => {
    if (index < 2) return;
    if (tag === 'Noun') {
      nounIndexes.push(index);
    }
  });
  // Check if the tags before noun matches pattern
  nounIndexes = nounIndexes.filter((nounIndex) => {
    const advTag = tags[nounIndex - 2];
    const adjTag = tags[nounIndex - 1];
    return advTag === 'Adverb' && adjTag === 'Adjective';
  });
  // Conjure band names with the remaining nouns + their preceding adv+adj
  nounIndexes.forEach((nounIndex) => {
    const bandName = `${capitalize(sent.terms[nounIndex - 2].text)} ${
      capitalize(sent.terms[nounIndex - 1].text)} ${
      capitalize(sent.terms[nounIndex].text)}`;
    arrBandNames.push(bandName);
  });
  return arrBandNames;
}
// Value + adj + noun
function threeWordValAdjNoun(sent, tags) {
  const arrBandNames = [];
  let nounIndexes = [];
  tags.forEach((tag, index) => {
    if (index < 2) return;
    if (tag === 'Noun') {
      nounIndexes.push(index);
    }
  });
  // Check if the tags before noun matches pattern
  nounIndexes = nounIndexes.filter((nounIndex) => {
    const valTag = tags[nounIndex - 2];
    const adjTag = tags[nounIndex - 1];
    return valTag === 'Value' && adjTag === 'Adjective';
  });
  // Conjure band names with the remaining nouns + their preceding val+adj
  nounIndexes.forEach((nounIndex) => {
    const bandName = `${capitalize(sent.terms[nounIndex - 2].text)} ${
      capitalize(sent.terms[nounIndex - 1].text)} ${
      capitalize(sent.terms[nounIndex].text)}`;
    arrBandNames.push(bandName);
  });
  return arrBandNames;
}
// (adv/adj) + noun, with 1st letter matching
function twoWordSameFirstLetter(sent, tags) {
  const arrBandNames = [];
  let nounIndexes = [];
  tags.forEach((tag, index) => {
    if (index < 1) return;
    if (tag === 'Noun') {
      nounIndexes.push(index);
    }
  });
  // Check if the tags before noun matches pattern
  nounIndexes = nounIndexes.filter((nounIndex) => {
    const prevTag = tags[nounIndex - 1];
    return prevTag === 'Adjective' || prevTag === 'Adverb';
  });
  // Check if the two words have same first char
  nounIndexes = nounIndexes.filter(nounIndex => sent.terms[nounIndex].text[0].toLowerCase() === sent.terms[nounIndex - 1].text[0].toLowerCase());
  // Conjure band names with the remaining nouns + their preceding adv+adj
  nounIndexes.forEach((nounIndex) => {
    const bandName = `${capitalize(sent.terms[nounIndex - 1].text)} ${
      capitalize(sent.terms[nounIndex].text)}`;
    arrBandNames.push(bandName);
  });
  return arrBandNames;
}

function findBandName(text) {
  let arrBandNames = [];
  const nlpText = nlp.text(text);
  nlpText.sentences.forEach((sent) => {
    const tags = sent.tags();
    let newBandNames = twoWordSameFirstLetter(sent, tags)
      .concat(threeWordAdvAdjNoun(sent, tags))
      .concat(threeWordValAdjNoun(sent, tags));
    newBandNames = newBandNames.filter(filterBandName);
    newBandNames = newBandNames.map(sanitizeBandName);
    // accumulate results
    arrBandNames = arrBandNames.concat(newBandNames);
  });
  return arrBandNames;
}

module.exports = findBandName;
