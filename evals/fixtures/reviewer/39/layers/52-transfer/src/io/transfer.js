import { pipeline } from 'node:stream/promises';

// Moves data from a readable source into a writable destination. Shared by
// import and export so both handle stream errors the same way: an error on
// either side rejects and destroys both streams.
export function transfer(source, destination) {
  return pipeline(source, destination);
}
