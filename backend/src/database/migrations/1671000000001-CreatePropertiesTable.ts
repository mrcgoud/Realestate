import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreatePropertiesTable1671000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable PostGIS extension
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "postgis"');

    await queryRunner.createTable(
      new Table({
        name: 'properties',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'title',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'price',
            type: 'numeric',
            precision: 15,
            scale: 2,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['apartment', 'house', 'commercial', 'land', 'office', 'villa'],
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['available', 'sold', 'rented', 'pending', 'delisted'],
            default: "'available'",
          },
          {
            name: 'address',
            type: 'varchar',
          },
          {
            name: 'city',
            type: 'varchar',
          },
          {
            name: 'state',
            type: 'varchar',
          },
          {
            name: 'postalCode',
            type: 'varchar',
          },
          {
            name: 'country',
            type: 'varchar',
          },
          {
            name: 'latitude',
            type: 'numeric',
            precision: 10,
            scale: 8,
          },
          {
            name: 'longitude',
            type: 'numeric',
            precision: 11,
            scale: 8,
          },
          {
            name: 'location',
            type: 'geometry',
            spatialFeatureType: 'Point',
            srid: 4326,
            isNullable: true,
          },
          {
            name: 'bedrooms',
            type: 'integer',
          },
          {
            name: 'bathrooms',
            type: 'integer',
          },
          {
            name: 'areaSquareFeet',
            type: 'numeric',
            precision: 10,
            scale: 2,
          },
          {
            name: 'yearBuilt',
            type: 'integer',
          },
          {
            name: 'features',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'amenities',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'pricePerSquareFoot',
            type: 'numeric',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'views',
            type: 'integer',
            default: 0,
          },
          {
            name: 'favorites',
            type: 'integer',
            default: 0,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'ownerId',
            type: 'uuid',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Add foreign key
    await queryRunner.createForeignKey(
      'properties',
      new TableForeignKey({
        columnNames: ['ownerId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Add indexes
    await queryRunner.createIndex(
      'properties',
      new TableIndex({
        columnNames: ['location'],
        isFulltext: false,
      }),
    );

    await queryRunner.createIndex(
      'properties',
      new TableIndex({
        columnNames: ['status', 'createdAt'],
      }),
    );

    await queryRunner.createIndex(
      'properties',
      new TableIndex({
        columnNames: ['city', 'type'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('properties');
  }
}
