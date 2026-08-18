/**
 * Parses ?page and ?limit query params and returns Prisma-compatible
 * { skip, take } plus metadata for the response.
 *
 * Defaults: page=1, limit=20. Max limit is capped at 100.
 *
 * Usage in a route:
 *   const { skip, take, page, limit } = paginate(req)
 *   const items = await prisma.booking.findMany({ skip, take, ... })
 *   res.json({ data: items, page, limit, count: items.length })
 */
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
