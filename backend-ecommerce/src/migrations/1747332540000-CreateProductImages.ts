import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductImages1747332540000 implements MigrationInterface {
    name = 'CreateProductImages1747332540000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "product_images" (
                "id" SERIAL NOT NULL,
                "url" character varying NOT NULL,
                "alt" character varying,
                "order" integer NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "productId" character varying,
                CONSTRAINT "PK_product_images" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "product_images"
            ADD CONSTRAINT "FK_product_images_product"
            FOREIGN KEY ("productId")
            REFERENCES "products"("id")
            ON DELETE CASCADE
            ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_images" DROP CONSTRAINT "FK_product_images_product"`);
        await queryRunner.query(`DROP TABLE "product_images"`);
    }
} 