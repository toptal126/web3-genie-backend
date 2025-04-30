import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private db: Database.Database;

  constructor() {
    const dbPath = path.resolve(process.cwd(), 'data', 'chatbot.db');

    // Ensure the data directory exists
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.db = new Database(dbPath);
  }

  async onModuleInit() {
    // Create tables if they don't exist
    this.createTables();
  }

  private createTables() {
    // Users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wallet_address TEXT UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Conversations table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Messages table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER,
        role TEXT CHECK(role IN ('user', 'assistant', 'system')),
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id)
      )
    `);

    // System configurations table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS system_configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE,
        value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default system configurations
    const defaultConfigs = [
      {
        key: 'system_prompt',
        value: 'You are a helpful AI assistant with Web3 knowledge.',
      },
      { key: 'web3_enabled', value: 'true' },
      { key: 'web_search_enabled', value: 'false' },
    ];

    const insertStmt = this.db.prepare(
      'INSERT OR IGNORE INTO system_configs (key, value) VALUES (?, ?)',
    );

    for (const config of defaultConfigs) {
      insertStmt.run(config.key, config.value);
    }
  }

  // Helper methods for database operations
  prepare<T extends {} | unknown[]>(sql: string): Database.Statement<T> {
    return this.db.prepare(sql) as Database.Statement<T>;
  }

  query(sql: string, params: any[] = []) {
    return this.db.prepare(sql).all(params);
  }

  queryOne(sql: string, params: any[] = []) {
    return this.db.prepare(sql).get(params);
  }

  run(sql: string, params: any[] = []) {
    return this.db.prepare(sql).run(params);
  }
}
