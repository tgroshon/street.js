'use strict'

module.exports = function validateOptions (options) {
  if (options.loadEnv)
    require('dotenv').load()

  if (!options.src)
    throw new Error('Specify a source directory in options.src')

  if (!options.dest) {
    if (!process.env.S3_BUCKET) {
      throw new Error('Specify an S3 Bucket in Env. Var. S3_BUCKET or options.dest')
    }
    options.dest = process.env.S3_BUCKET
  }

  if (!process.env.AWS_ACCESS_KEY_ID){
    if (!options.awsKey){
      throw new Error('Specify an AWS Access Key Id in Env. Var. AWS_ACCESS_KEY_ID or options.awsKey')
    }
    process.env.AWS_ACCESS_KEY_ID = options.awsKey
  }

  if (!process.env.AWS_SECRET_ACCESS_KEY){
    if (!options.awsSecret){
      throw new Error('Specify an AWS Secret Access Key in Env. Var. AWS_SECRET_ACCESS_KEY or options.awsSecret')
    }
    process.env.AWS_SECRET_ACCESS_KEY = options.awsSecret
  }

  return options
}
