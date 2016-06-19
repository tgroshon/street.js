import fs from 'fs'
import path from 'path'
import zlib from 'zlib'
import crypto from 'crypto'
import mime from 'mime'
import wu from 'wu'

/**
  * Uploadable represents a file object that can be uploaded to remote storage
  */
class Uploadable {
  constructor (name, path) {
    this.name = name // relative path within source dir
    this.path = path // path to file
    this._hash = null
    this._buffer = null
    this.contentType = mime.lookup(this.path || this.name)
  }

  get hash () {
    if (!this._hash) {
      this._hash = crypto.createHash('md5')
        .update(this._buffer || fs.readFileSync(this.path))
        .digest('hex')
    }
    return this._hash
  }

  get data () {
    if (this._buffer) return this._buffer
    return fs.createReadStream(this.path)
  }

  set data (buffer) {
    this._buffer = buffer
  }
}

/**
 * Find all the files in the source directory and generate a manifest
 * @param String: Path to the directory that should be uploaded
 * @return Map<String, Uploadable>: Record of the list of uploadables and the manifest
 */
export default async function collect (srcDir, log) {
  var contentDir = path.resolve(srcDir)
  var filePaths = await findFilePaths(contentDir)
  log.debug({files: filePaths, directory: contentDir}, 'Files found in source directory')

  var uploadables = filePaths.reduce((m, filepath) => {
    var uploadable = new Uploadable(filepath.replace(`${contentDir}/`, ''), filepath)
    return m.set(uploadable.name, uploadable)
  }, new Map())

  if (filePaths.length > 0) {
    // persistManifestToDisk(result.manifest, contentDir)
    var manifestUp = new Uploadable('.manifest.json.gz', `${contentDir}/.manifest.json.gz`)
    uploadables.set(manifestUp.name, manifestUp)
    manifestUp.data = zlib.gzipSync(mapToJSON(uploadables))
  }

  return uploadables
}

const mapToJSON = (m) => {
  let obj = wu(m.entries()).reduce((data, [key, val]) => {
    data[key] = val
    return data
  }, {})
  return JSON.stringify(obj)
}
// const persistManifestToDisk = (manifest, outputDir) => {
//   fs.writeFileSync(`${outputDir}/.manifest.json.gz`,
//                    zlib.gzipSync(JSON.stringify(manifest)))
// }

/**
  * Finds all the files in a directory and sub-directories.
  * @param String: The directory to search under
  * @return Promise<Array<String>>: A list of file paths found under this directory
  */
export async function findFilePaths (dir) {
  var foundPaths = []
  var files = fs.readdirSync(dir)

  while (files.length > 0) {
    let file = files.pop()
    if (!file) break

    let filePath = `${dir}/${file}`
    let stat = fs.lstatSync(filePath)

    if (stat.isDirectory()) {
      foundPaths = foundPaths.concat(await findFilePaths(filePath))
    } else if (stat.isFile()) {
      foundPaths.push(filePath)
    }
  }

  return foundPaths
}
