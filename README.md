street.js
=========

Smart Uploader for AWS S3 buckets.  Generates a manifest file upon first upload;
subsequent uploads only send changed files.  Especially useful as a deploy tool
for uploading static websites to S3. Benefits of using Street:

* Upload only changed files; reduces **PUT** requests.
* GZip Compressed **manifest** file stored on S3 is very small.
* Mime-type lookup on upload to facilitate proper browser handling.
* Non-destructive *(mostly)*.  Works with existing buckets and data. See *Manifest
  File* section below for more details.

tl;dr
-----

* Install globally with `npm install -g street` to get the `street` cli tool.
* Set **AWS_ACCESS_KEY_ID** and **AWS_SECRET_ACCESS_KEY** environment variables
  at root of your project *(also smart to add it to your `.gitignore`)*.
* Run `street --bucket <Target S3 Bucket> path/to/upload/dir`

Installation
------------

Install with `npm`.  A global installation is preferable:

```bash
# preferred global install
npm install -g street

# local install for specific setups
npm install street
```

Command Line
------------

A helpful interface into Street is using the command line tool `bin/street`.
If you installed globally, it should be available on your path as `street`. The
command line tool requires a path to a directory that you want to upload to S3.
Run `street --help` to see a list of options.

#### -b, --bucket [bucket], S3 Destination Bucket ####

The Amazon S3 bucket to be the destination of your uploaded files.

*Example*: `street -b <S3 bucket name> path/to/upload/dir`

#### -k, --aws-key [key], AWS Access Key Id ####

The AWS Access Key Id to be used for authenticating the S3 session.  User must
have `PUT` and `GET` permissions on the bucket.

*Example*: `street -k <AWS Access Key Id> path/to/upload/dir`

#### -s, --aws-secret [secret], AWS Secret Access Key ####

The AWS Secret Access Key associated with the AWS Access Key Id you are using.

*Example*: `street -s <AWS Secret Key> path/to/upload/dir`

#### -v, --verbose, Run with expanded messages ####

Shows the number of files uploaded, but not much else.  This option will do more
in the future.

*Example*: `street -v /path/to/upload/dir`

#### -n, --dry-run, Run but do not upload ####

Best if used in conjuction with `DEBUG=street:*` or `--verbose` option.

*Example*:

`street -n path/to/upload/dir`

`street -nv path/to/upload/dir`

`DEBUG=street:* street -n path/to/upload/dir`

Run Programmatically
--------------------

Running `var street = require('street')` will get you access to the the
underlying function.  Call the exposed function with a map of parameters:

```javascript
var street = require('street');

var params = {
  src: 'path/to/upload/dir',     // Path to directory to upload.
  isDryRun: false,               // Disable upload mechanism.
  dest: 'bucketname.com',        // Name of S3 Bucket to upload to.
  awsKey: 'AWS Access Key Id',   // AWS Access Key Id for authentication w/ S3.
  awsSecret: 'AWS Secret Key',   // AWS Secret Key for authentication w/ S3.
  loadEnv: true,                 // Load Environment Variables with 'dotenv'.
  verbose: true,                 // Trigger extra messages.
  logstream: process.stdout      // The stream to write logs to
};

street(params); // Begins Deploy Process
```

You can make this part of a [Grunt](http://gruntjs.com/) task or your own,
standalone deploy script.  Dealer's choice!


Manifest File
-------------
The **manifest** file is a GZipped JSON file that maps S3 Object Keys (file
names) to MD5 Hashes.

The **manifest** file is generated each time Street is run.  On the first run
of Street on a specific directory, the **manifest** file is written to that
directory (called the *upload directory*), and all files it found are uploaded to
S3.  The next time Street is run, a **new manifest** is generated locally, the
**old manifest** is pulled down from S3, and the two files are compared to
search for differences.  The **new manifest** is only written if files have
been changed.  If files have been changed, the new **manifest** and changed
files are then uploaded to S3 where they replace the objects of the same name.

This approach has two important effects that you should be aware of:

1. **\*IMPORTANT\*** Upon first run of Street, all files in the directory
   and a new **manifest** file will be uploaded and replace S3 objects with
   the same name.

2. A **manifest** file on S3 does *not* hold information on all the objects in
   that bucket; only on objects that Street has specifically uploaded.

Keep these in mind as you work.

Development Tasks
-----------------

Street is in *very early* development. Here are some things that would be very
helpful.

* Tests, Tests, and more Tests
* Integration story with Build/Deploy tools like Grunt, Gulp, or Broccoli
* Performance Benchmarks (because people always ask)
