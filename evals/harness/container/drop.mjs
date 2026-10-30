// Runs a command as the unprivileged runner (see entry.sh). Used only when the
// container starts as root, which a case with unreadable files needs: the file
// is made root-owned with mode 000, so the role cannot chmod it back. Claude
// Code refuses bypassPermissions as root, so the role itself never runs as root.
//
//   node /opt/eval/drop.mjs <uid> <command> [args...]
import { spawnSync } from 'node:child_process';
import os from 'node:os';

const [uid, cmd, ...args] = process.argv.slice(2);
const id = Number(uid);
process.setgroups([]);
process.setgid(id);
process.setuid(id);
const r = spawnSync(cmd, args, { stdio: 'inherit', env: { ...process.env, HOME: '/home/runner', USER: 'runner', LOGNAME: 'runner' } });
if (r.error) { console.error(`eval runtime: ${r.error.message}`); process.exit(97); }
process.exit(r.status ?? 128 + (os.constants.signals[r.signal] ?? 0));
