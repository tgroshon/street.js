import zlib from 'zlib'
import wu from 'wu'
import validateOptions from './validate-options'
import collect from './collect'
import { getFile, putUploadable } from './s3'
import { setCachedFromObject } from './cache'
import createLogger from './logger'

let log

/**
 * Run the main function of Street
 * @param Object: Street option object
 */
export default async function run (options) {
  validateOptions(options)
  setCachedFromObject(options)
  log = createLogger(options.logstream, options.verbose ? 'debug' : 'info')

  try {
    var uploadables = await collect(options.src, log)
  } catch (err) {
    return log.error({err}, 'Error while reading source directory')
  }

  log.debug({uploadables}, 'Files in source directory')
  try {
    var diffFiles = await diff(uploadables)
  } catch (err) {
    return log.error({err}, 'Error while diffing with remote manifest')
  }

  log.debug({diffFiles}, 'Files different from remote manifest')
  // Always contains a new Manifest file
  if (diffFiles.length > 1) {
    var newUploadables = diffFiles.map((file) => uploadables.get(file))

    if (options.isDryRun) {
      log.debug({uploaded: newUploadables}, 'Finished Uploading')
    } else {
      await upload(newUploadables)
      log.info({uploaded: newUploadables}, 'Finished Uploading')
    }
  }
}

const compareToManifest = (uploadableMap, oldManifest) => {
  return wu(uploadableMap.entries())
    .filter(([key, value]) => value.hash !== oldManifest[key])
}

/**
  * Download, unzip, and parse the manifest from remote storage
  */
async function getOldManifest () {
  try {
    var data = await getFile('.manifest.json.gz')
  } catch (err) {
    if (err.code === 'NoSuchKey') return {}
    else throw err
  }
  var unzippedBody = zlib.gunzipSync(data.Body)
  return JSON.parse(unzippedBody)
}

/**
 * Lookup previous manifest from storage destination and compare with
 * current map of uploadables.
 * @param Map<String, Uploadable>: A mapping of filepaths to uploadables
 * @return Array<String> List of filenames with different hashes
 */
async function diff (uMap) {
  let oldManifest = await getOldManifest()
  return compareToManifest(uMap, oldManifest)
}

/**
 * Upload files to storage destination
 * @param Array<Uploadable>: List of uploadables to upload
 * @param Object: Street option object
 * @return Promise: A promise chain of all upload actions
 */
function upload (uploadables) {
  var promises = uploadables.map((uploadable) => putUploadable(uploadable))
  return Promise.all(promises)
}
