import {sequelizeConnection} from '../../db/config';
import {Package} from '../../models/package';
import { Price } from '../../models/price'
import PackageService from '../../services/package.service';

// !======== NOTE =========!
// My solution doesn’t account for the default prices that have been created
// by direct package model writes, like seeding the database.
// I would argue that the initial design is rather poor/inflexible and would
// require a structure change to increase future flexibility.
// Though I would have to know more about the context/use cases to make a firm judgement.

describe('PackageService', () => {
	// Set the db object to a variable which can be accessed throughout the whole test file
	const db = sequelizeConnection;
	const packageService = PackageService;

	// Before any tests run, clear the DB and run migrations with Sequelize sync()
	beforeEach(async () => {
		await db.sync({force: true});
	});

	afterAll(async () => {
		await db.close();
	});

	it('Updates the current price of the provided package', async () => {
		const newPack = await packageService.createPackage('Dunderhonung', 100_00);
		const updatedPackage = await packageService.addPackagePrice(newPack, 200_00);

    expect(updatedPackage.priceCents).toBe(200_00);
  });

	it('Stores the price of the created package in its price history', async () => {
    const newPack = await packageService.createPackage('Dunderhonung', 100_00);

		const prices = await Price.findAll({ where: { packageId: newPack.id } });
		
		expect(prices.length).toBe(1);
    expect(prices[0].priceCents).toBe(100_00);
  });

	// This tests cover feature request 1. Feel free to add more tests or change
	// the existing one.
	it('Supports adding a price for a specific municipality', async () => {
		const newPack = await packageService.createPackage('Dunderhonung', 100_00);

		await packageService.addPackagePrice(newPack, 200_00, 'Göteborg');

		const response = await packageService.priceFor(newPack.id, 'Göteborg');

		expect(response).toBe(200_00);
	});
});
