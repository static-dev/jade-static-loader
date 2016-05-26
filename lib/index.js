import jade from 'jade'
import Joi from 'joi'
import path from 'path'

module.exports = function (source) {
  this.cacheable && this.cacheable(true)

  const _opts = (this.options ? this.options.jade : {}) || {}
  const schema = Joi.object().keys({
    filename: Joi.string().default(this.resourcePath),
    pretty: Joi.boolean().default(true),
    doctype: Joi.string(),
    self: Joi.boolean(),
    debug: Joi.boolean(),
    compileDebug: Joi.boolean(),
    cache: Joi.boolean(),
    compiler: Joi.func(),
    parser: Joi.func(),
    globals: Joi.array().single(),
    locals: Joi.object().default({})
  })

  // validate options
  const validated = Joi.validate(_opts, schema)
  if (validated.error) { throw validated.error }
  const opts = validated.value

  // compile the template to a function
  const tpl = jade.compile(source, opts)

  // add all dependencies to webpack
  tpl.dependencies.map(this.addDependency.bind(this))

  // render template
  opts.locals._filename = path.basename(this.resourcePath, '.jade')
  const rendered = tpl(opts.locals)

  // stringify before returning so it's valid js for webpack
  return 'module.exports = ' + JSON.stringify(rendered)
}
