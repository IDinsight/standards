import { open, rename, rm } from 'node:fs/promises';
import path from 'node:path';

import { literal } from '@records/db';

import { HEADER, recordLine } from './csv.js';
import { selectRecordsSql, toRecord } from './records.js';

export const DEFAULT_BATCH_SIZE = 500;

// Streams the records matching the filter into a CSV file at outputPath.
// Everything runs in one transaction on the caller's (idle) connection: the
// export is recorded in export_jobs, rows are read through a server-side
// cursor batchSize at a time and appended to <outputPath>.partial, and the
// file is renamed into place before COMMIT. Any failure rolls the
// transaction back and removes the files.
export async function exportRecords(db, filter, outputPath, { batchSize = DEFAULT_BATCH_SIZE } = {}) {
  if (!Number.isInteger(batchSize) || batchSize < 1) throw new RangeError('batchSize must be a positive integer');
  const sql = selectRecordsSql(filter);
  const partialPath = `${outputPath}.partial`;
  let file = null;
  let renamed = false;
  await db.query('BEGIN');
  try {
    const { rows: [job] } = await db.query(
      `INSERT INTO export_jobs (filter, file_name) VALUES (${literal(JSON.stringify(filter ?? {}))}, ${literal(path.basename(outputPath))}) RETURNING id`,
    );
    await db.query(`DECLARE export_cursor NO SCROLL CURSOR FOR ${sql}`);
    file = await open(partialPath, 'w');
    await file.write(HEADER);
    let rowCount = 0;
    for (;;) {
      const { rows } = await db.query(`FETCH FORWARD ${batchSize} FROM export_cursor`);
      if (rows.length > 0) await file.write(rows.map((row) => recordLine(toRecord(row))).join(''));
      rowCount += rows.length;
      if (rows.length < batchSize) break;
    }
    await db.query('CLOSE export_cursor');
    await db.query(`UPDATE export_jobs SET row_count = ${rowCount}, finished_at = now() WHERE id = ${literal(Number(job.id))}`);
    await file.close();
    file = null;
    await rename(partialPath, outputPath);
    renamed = true;
    await db.query('COMMIT');
    return { jobId: Number(job.id), path: outputPath, rowCount };
  } catch (error) {
    await file?.close().catch(() => {});
    await rm(partialPath, { force: true }).catch(() => {});
    if (renamed) await rm(outputPath, { force: true }).catch(() => {});
    await db.query('ROLLBACK').catch(() => {});
    throw error;
  }
}
