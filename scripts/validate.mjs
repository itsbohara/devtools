import { loadData } from '../src/lib/load.ts';

try {
  const { needs, tools } = loadData();
  console.log(`✓ ${needs.length} needs, ${tools.length} tools — data valid`);
} catch (error) {
  console.error(`✗ ${error.message}`);
  process.exit(1);
}
