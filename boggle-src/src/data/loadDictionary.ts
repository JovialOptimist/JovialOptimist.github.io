let dictionaryPromise: Promise<Set<string>> | null = null;

export async function loadDictionary(): Promise<Set<string>> {
  if (!dictionaryPromise) {
    dictionaryPromise = fetchDictionary();
  }
  return dictionaryPromise;
}

async function fetchDictionary(): Promise<Set<string>> {
  const base = import.meta.env.BASE_URL;
  const response = await fetch(`${base}enable1.txt`);
  if (!response.ok) {
    throw new Error("Failed to load dictionary");
  }

  const text = await response.text();
  const words = new Set<string>();

  for (const line of text.split("\n")) {
    const word = line.trim().toLowerCase();
    if (word.length >= 4) {
      words.add(word);
    }
  }

  return words;
}
