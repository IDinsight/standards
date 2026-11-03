#!/usr/bin/env node
import { quote, zones } from '../src/rates.js';

const [weight, zone = 'domestic'] = process.argv.slice(2);

if (!weight) {
  console.error(`usage: rates <weight-kg> [${zones().join('|')}]`);
  process.exit(2);
}

try {
  console.log(quote(Number(weight), zone).toFixed(2));
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
