import { production } from '../config/production.ts';
import { createApp } from './app.ts';

// The app instance the admin tool's host process loads in production.
export const app = createApp(production);
