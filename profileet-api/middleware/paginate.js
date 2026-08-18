
function paginate(req) {
  const page  = Math.max(1, parseInt(req.query.page, 10)  || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20))
  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  }
}

module.exports = { paginate }
