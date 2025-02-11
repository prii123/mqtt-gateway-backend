import { ConfigModule, ConfigService } from "@nestjs/config";
import { DataSource, DataSourceOptions } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

ConfigModule.forRoot({
    // envFilePath:  `.${process.env.NODE_ENV}.env`
    isGlobal: true,
  });

const configService = new ConfigService()

export const DataSourceConfig: DataSourceOptions = {
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME ,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [__dirname + '/../**/**/*.entity{.ts,.js}'],  //['dist/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts, .js}'],
    synchronize: true,
    migrationsRun:true,
    logging: false,
    namingStrategy: new SnakeNamingStrategy()
}

export const AppDS = new DataSource(DataSourceConfig);