/**
 * Extracts clean data from LDOCE raw entry using fallback:
 *   Sense 1 → Sense 2 → GrammarNote, max 5 examples.
 */
function extractLdoceData(rawEntry) {
  const extracted = {
    examples: [],
    ldoce_phrases: rawEntry.Phrases || [],
    ldoce_phrasal_verbs: rawEntry.PhrasalVerbs || [],
    ldoce_idioms: rawEntry.Idioms || [],
  };

  const senses = rawEntry.Senses || [];
  let foundExamples = false;

  for (let i = 0; i < senses.length; i++) {
    const currentSense = senses[i];
    if (currentSense.Examples && currentSense.Examples.length > 0) {
      extracted.examples = currentSense.Examples.slice(0, 5).map((ex) => ({
        text: ex.text,
        translation: ex.translation || '',
      }));
      foundExamples = true;
      break;
    }
  }

  if (!foundExamples && rawEntry.GrammarNotes) {
    if (rawEntry.GrammarNotes.Examples) {
      extracted.examples = rawEntry.GrammarNotes.Examples.slice(0, 5).map((ex) => ({
        text: ex.text,
        translation: ex.translation || '',
      }));
    }
  }

  return extracted;
}

module.exports = { extractLdoceData };
