import { sequelizeConnection } from '../db/config'
import {Package} from '../models/package';
import { Price } from '../models/price';

export const getAll = async () => {
  return await Package.findAll({
    include: [
      {model: Price, as: 'prices'},
    ],
  });
}

export const createPackage = async (name: string, priceCents: number, municipality?: string) => {
  let newPackage: Package;

  try {
    newPackage = await sequelizeConnection.transaction(t => {
      return Package.create({ name }, { transaction: t });
    });
  } catch (err: unknown) {
    throw new Error('Error handling the transaction');
  }

  return addPackagePrice(newPackage, priceCents, municipality)
}

export const addPackagePrice = async (pack: Package, newPriceCents: number, municipality?: string, createdAt?: Date) => {
  try {
    const newPackage = await sequelizeConnection.transaction(async t => {
      const createdAtDate = createdAt ?? new Date();
      const newPrice = await Price.create({
        priceCents: newPriceCents,
        ...(municipality && { municipality }),
        packageId: pack.id,
        createdAt: createdAtDate,
        updatedAt: createdAtDate,
      }, { transaction: t });

      // If the municipality is not set, then it's a default price
      // that will be set on the package.
      if (!newPrice.municipality) {
        pack.priceCents = newPrice.priceCents;
      }

      return pack.save({ transaction: t });
    });

    return newPackage;
  } catch (err: unknown) {
    throw new Error('Error handling the transaction');
  }
}

export const priceFor = async (packageId: Package['id'], municipality: string) => {
  const [latestPrice] = await Price.findAll({ where: { municipality, packageId }, order: [['createdAt', 'DESC']]})

  if (!latestPrice) {
    return null;
  }

  return latestPrice.priceCents;
}

export default {
  getAll,
  createPackage,
  addPackagePrice,
  priceFor,
};
