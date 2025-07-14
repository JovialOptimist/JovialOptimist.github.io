import json
import re

def determine_word_type(term, definition):
    """
    Determine the word type based on patterns in the term and definition
    """
    # Check for verb patterns in Spanish
    verb_indicators = ["ar ", "er ", "ir ", "arse", "erse", "irse"]
    
    # Common verb patterns in definitions
    verb_def_patterns = ["to ", " to ", "doing", "making"]
    
    # Check for clear verb patterns
    for pattern in verb_indicators:
        if pattern in term + " ":
            return "verb"
    
    for pattern in verb_def_patterns:
        if pattern in definition.lower():
            return "verb"
    
    # Common adjective endings and patterns in Spanish
    adj_patterns = ['/a', 'o/a', 'oso/a', 'ico/a', 'ado/a', 'ido/a', 'ero/a', 'ible', 'able']
    
    # Check for adjective patterns
    for pattern in adj_patterns:
        if pattern in term:
            return "adjective"
    
    # Check for adjective patterns in the definition
    adj_def_indicators = ['being', 'feeling', 'having', 'like', 'able to']
    adj_english_endings = ["ous", "ful", "less", "ive", "able", "ible", "ent", "ant"]
    
    for indicator in adj_def_indicators:
        if indicator in definition.lower():
            return "adjective"
    
    # Check if definition is a single adjective
    def_words = definition.lower().split()
    if len(def_words) == 1:
        for ending in adj_english_endings:
            if def_words[0].endswith(ending):
                return "adjective"
    
    # Noun indicators
    noun_indicators = ["el ", "la ", "los ", "las ", "un ", "una ", "the ", "a "]
    
    for indicator in noun_indicators:
        if definition.lower().startswith(indicator):
            return "noun"
    
    # Default to noun if no other pattern matches
    return "noun"

def parse_words_file():
    word_matches = []
    
    with open('words.txt', 'r', encoding='utf-8') as file:
        for line in file:
            # Skip empty lines
            if line.strip() == '':
                continue
                
            # Split on tab character
            parts = line.strip().split('\t')
            
            if len(parts) == 2:
                term = parts[0].strip()
                definition = parts[1].strip()
                
                # Determine word type
                word_type = determine_word_type(term, definition)
                
                # Add to results
                word_matches.append({
                    "term": term,
                    "definition": definition,
                    "type": word_type
                })
    
    return word_matches

def main():
    word_matches = parse_words_file()
    
    # Create JSON structure
    output = {
        "wordMatches": word_matches
    }
    
    # Write to JSON file
    with open('words.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"Transformation complete. {len(word_matches)} entries written to words.json")

if __name__ == "__main__":
    main()