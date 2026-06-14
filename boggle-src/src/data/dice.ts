/** Super Big Boggle 36 dice (6 faces each). */
const SUPER_BIG_DICE_RAW = [
  "AAAFRS",
  "AAEEEE",
  "AAEEOO",
  "AAFIRS",
  "ABDEIO",
  "ADENNN",
  "AEEEEM",
  "AEEGMU",
  "AEGMNN",
  "AEILMN",
  "AEINOU",
  "AFIRSY",
  "AnErHeInQuTh",
  "BBJKXZ",
  "CCENST",
  "CDDLNN",
  "CEIITT",
  "CEIPST",
  "CFGNUY",
  "DDHNOT",
  "DHHLOR",
  "DHHNOW",
  "DHLNOR",
  "EHILRS",
  "EIILST",
  "EILPST",
  "EIO###",
  "EMTTTO",
  "ENSSSU",
  "GORRVW",
  "HIRSTV",
  "HOPRST",
  "IPRSYY",
  "JKQuWXZ",
  "NOOTUW",
  "OOOTTU",
] as const;

const DOUBLE_LETTERS = ["An", "Er", "He", "In", "Qu", "Th"] as const;
const BLANK = "###";

/** Parse a die string into its six faces. */
export function parseDieFaces(raw: string): string[] {
  if (raw === "AnErHeInQuTh") {
    return [...DOUBLE_LETTERS];
  }

  const faces: string[] = [];
  let i = 0;
  while (i < raw.length && faces.length < 6) {
    if (raw.startsWith(BLANK, i)) {
      faces.push(BLANK);
      i += 3;
    } else if (raw.startsWith("Qu", i)) {
      faces.push("Qu");
      i += 2;
    } else {
      faces.push(raw[i]!);
      i += 1;
    }
  }

  return faces;
}

export const SUPER_BIG_DICE: string[][] = SUPER_BIG_DICE_RAW.map(parseDieFaces);

export function isDoubleLetterFace(face: string): boolean {
  return face.length === 2 && face !== BLANK;
}

export function isBlankFace(face: string): boolean {
  return face === BLANK;
}

/** Effective letter count for scoring (Qu/Th/etc. count as 2). */
export function faceLetterCount(face: string): number {
  if (isBlankFace(face)) return 0;
  return isDoubleLetterFace(face) ? 2 : 1;
}

/** Display form shown on the board and in the word preview. */
export function faceDisplay(face: string): string {
  if (isBlankFace(face)) return "";
  return face.toUpperCase();
}

export function pathToWordString(faces: string[]): string {
  return faces.map(faceDisplay).join("");
}

export function effectiveWordLength(faces: string[]): number {
  return faces.reduce((sum, face) => sum + faceLetterCount(face), 0);
}
