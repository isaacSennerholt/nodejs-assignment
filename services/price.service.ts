const { Op } = require('sequelize')
import { Package } from '../models/package'
import { Price } from '../models/price'

export default {
  // You may want to use this empty method 🤔
  async getPriceHistory(pack: Package, year: number, municipality?: string) {
    const prices = await Price.findAll({
      where: {
        packageId: pack.id,
        ...(municipality && { municipality }),
        createdAt: {
          [Op.gte]: new Date(year, 0, 1),
        },
      },
    })

    const pricesByMunicipality = prices.reduce((map, price) => {
      const municipality = price.municipality ?? 'default'
      const priceCents = price.priceCents

      if (!map[municipality]) {
        map[municipality] = []
      }

      map[municipality].push(priceCents)

      return map
    }, {} as Record<string, number[]>)

    return pricesByMunicipality
  },
}