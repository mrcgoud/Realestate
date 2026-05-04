import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreatePropertyImagesTable1671000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'property_images',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'propertyId',
            type: 'uuid',
          },
          {
            name: 'url',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'isPrimary',
            type: 'boolean',
            default: false,
          },
          {
            name: 'order',
            type: 'integer',
            default: 0,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add foreign key
    await queryRunner.createForeignKey(
      'property_images',
      new TableForeignKey({
        columnNames: ['propertyId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'properties',
        onDelete: 'CASCADE',
      }),
    );

    // Add index
    await queryRunner.createIndex(
      'property_images',
      new TableIndex({
        columnNames: ['propertyId', 'isPrimary'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('property_images');
  }
}
