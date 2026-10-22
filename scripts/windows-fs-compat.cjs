/* eslint-disable @typescript-eslint/no-require-imports -- Node --require preloads must be CommonJS. */
// Some Windows project volumes report EISDIR when readlink examines a regular
// file. Next's output tracer expects EINVAL for a non-link. Normalize only that
// verified case, only in the build process; keep all actual link errors intact.
const fs = require('node:fs');
if (process.platform === 'win32') {
  const normalize = (error, path) => {
    if (error?.code === 'EISDIR') {
      try { if (!fs.lstatSync(path).isSymbolicLink()) error.code = 'EINVAL'; }
      catch { /* Keep the original error if the target cannot be inspected. */ }
    }
    return error;
  };
  const readlink = fs.readlink;
  fs.readlink = function (path, ...args) {
    const callback = args.pop();
    return readlink.call(this, path, ...args, (error, result) => callback(normalize(error, path), result));
  };
  const readlinkSync = fs.readlinkSync;
  fs.readlinkSync = function (path, ...args) {
    try { return readlinkSync.call(this, path, ...args); }
    catch (error) { throw normalize(error, path); }
  };
  const readlinkPromise = fs.promises.readlink;
  fs.promises.readlink = async function (path, ...args) {
    try { return await readlinkPromise.call(this, path, ...args); }
    catch (error) { throw normalize(error, path); }
  };
  require('node:module').syncBuiltinESMExports();
}
