const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I to avoid ambiguity

export function generatePnr(): string {
  let pnr = ''
  for (let i = 0; i < 6; i += 1) {
    pnr += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return pnr
}
