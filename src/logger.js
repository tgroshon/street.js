import bunyan from 'bunyan'

var logger

export default function createLogger (stream, level) {
  if (logger) return logger

  logger = bunyan.createLogger({
    name: 'street',
    serializers: {err: bunyan.stdSerializers.err},
    stream: stream || process.stdout,
    level
  })
  return logger
}
