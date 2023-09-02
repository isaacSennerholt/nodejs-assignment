import {type CreationOptional, DataTypes, type ForeignKey, type InferAttributes, type InferCreationAttributes, Model} from 'sequelize';
import {sequelizeConnection} from '../db/config';
import {type Package} from './package';

class Price extends Model<InferAttributes<Price>, InferCreationAttributes<Price>> {
	declare id: CreationOptional<number>;
	declare priceCents: number;
	declare municipality?: string;
	declare packageId: ForeignKey<Package['id']>;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
}

Price.init({
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	priceCents: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	municipality: {
		// Could be an enum, but that would require a lot of work to maintain.
		type: DataTypes.STRING,
		allowNull: true,
	},
	packageId: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	createdAt: DataTypes.DATE,
	updatedAt: DataTypes.DATE,
}, {
	sequelize: sequelizeConnection,
});

export {Price};
