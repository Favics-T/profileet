
function validate(schema) {
  return function (req, res, next) {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      
      const issues = result.error.issues.map(function (e) {
        return {
          field: e.path.length > 0 ? e.path.join('.') : undefined,
          message: e.message,
        }
      })

      return res.status(400).json({ error: 'Validation failed', issues: issues })
    }

   
    req.body = result.data
    next()
  }
}

module.exports = { validate }
