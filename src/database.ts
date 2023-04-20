import config from "./config";
import { Connection, createConnection } from "promise-mysql";

const bikeColumns = [
  { name: "id_compteur", type: "VARCHAR(255)" },
  { name: "id", type: "VARCHAR(255)" },
  { name: "name", type: "VARCHAR(255)" },
  { name: "sum_counts", type: "INT" },
  { name: "date", type: "VARCHAR(255)" },
  { name: "installation_date", type: "VARCHAR(255)" },
  { name: "counter", type: "VARCHAR(255)" },
  { name: "mois_annee_comptage", type: "VARCHAR(255)" },
];

const calendarColumns = [
  { name: "date", type: "VARCHAR(255)" },
  { name: "isVacation", type: "BOOL" },
  { name: "isWeekend", type: "BOOL" },
  { name: "dayName", type: "VARCHAR(255)" },
  { name: "dayIndex", type: "INT" },
] as const;

const weatherColumns = [
  { name: "t", type: "VARCHAR(255)" },
  { name: "date", type: "VARCHAR(255)" },
  { name: "u", type: "VARCHAR(255)" },
  { name: "rr1", type: "VARCHAR(255)" },
  { name: "rr3", type: "VARCHAR(255)" },
  { name: "ff", type: "VARCHAR(255)" },
  { name: "n", type: "VARCHAR(255)" },
] as const;

const dbName = "bike__prediction";

const tableColumnMatcher = {
  bike: bikeColumns,
  weather: weatherColumns,
  calendar: calendarColumns,
} as const;

type Table = keyof typeof tableColumnMatcher;

class Database {
  private conn: Connection;

  constructor(conn: Connection) {
    this.conn = conn;
  }

  public static create = async () => {
    const database = await this.connect();
    await database.upserTables();
    return database;
  };

  public static connect = async () => {
    const conn = await createConnection({
      host: config.db.host,
      user: config.db.user,
      database: dbName,
      password: config.db.password,
      port: config.db.port,
    });
    const database = new Database(conn);
    await database.upsertDatabase(dbName);
    await database.useDatabase(dbName);
    return database;
  };

  private getTableNames = () => Object.keys(tableColumnMatcher) as Table[];
  private getTableColumnsName = (table: Table) =>
    tableColumnMatcher[table].map((e) => e.name);
  private getTableColumns = (table: Table) => tableColumnMatcher[table];

  private useDatabase = async (db: string) => {
    const sql = `USE ${db}`;
    return this.conn.query(sql);
  };

  private upsertDatabase = async (db: string) => {
    const sql = `CREATE DATABASE IF NOT EXISTS ${db}`;
    return this.conn.query(sql);
  };

  private dropTable = async (table: string) => {
    const sql = `DROP TABLE ${table}`;
    return this.conn.query(sql);
  };

  public dropTables = async () => {
    return Promise.all(this.getTableNames().map(this.dropTable));
  };

  private upsertTable = async (table: Table) => {
    // prettier-ignore
    const sql = `CREATE TABLE IF NOT EXISTS ${table} (${this.formatColumnsWithType(table)})`;
    return this.conn.query(sql);
  };

  private upserTables = async () => {
    return Promise.all(this.getTableNames().map(this.upsertTable));
  };

  public insertMany = async (table: Table, values: string[][]) => {
    const sql = `INSERT INTO ${table} (${this.formatColumns(table)}) VALUES ?`;
    return this.conn.query(sql, [values]);
  };

  public fetch = async () => {};

  private formatColumns = (table: Table) =>
    this.getTableColumnsName(table).join(", ");

  private formatColumnsWithType = (table: Table) =>
    this.getTableColumns(table)
      .map((t) => `${t.name} ${t.type}`)
      .join(", ");

  public end = () => {
    this.conn.end();
  };
}

export default Database;
