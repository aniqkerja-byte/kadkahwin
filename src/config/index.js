import { brideSite } from './bride.js';
import { groomSite } from './groom.js';

const sites = { bride: brideSite, groom: groomSite };

// Mode-specific servers lock one site; the unqualified preview remains query-selectable.
export const siteConfig = sites[import.meta.env.MODE] ?? null;
export { brideSite, groomSite };
