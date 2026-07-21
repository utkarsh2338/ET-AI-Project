/**
 * src/scripts/importDataset.ts
 *
 * Wrapper script delegating directly to importData.ts.
 */

import { runImport } from './importData';
import mongoose from 'mongoose';

if (require.main === module) {
  runImport()
    .then(async () => {
      await mongoose.connection.close();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('\n❌ Import script failed:', err);
      await mongoose.connection.close();
      process.exit(1);
    });
}
