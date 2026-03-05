const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, '../database.sqlite');

// Создаем подключение к БД
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Ошибка подключения к БД:', err.message);
  } else {
    console.log('✅ Подключено к SQLite базе данных');
    
    // Создаем таблицу пользователей
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Создаем таблицу треков с привязкой к пользователю
    db.run(`
      CREATE TABLE IF NOT EXISTS tracks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        artist TEXT NOT NULL,
        filename TEXT NOT NULL,
        path TEXT NOT NULL,
        size INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);
  }
});

class User {
  // Создание нового пользователя
  static async create(username, email, password) {
    return new Promise((resolve, reject) => {
      // Хешируем пароль
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) return reject(err);
        
        db.run(
          'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
          [username, email, hash],
          function(err) {
            if (err) {
              if (err.message.includes('UNIQUE')) {
                reject(new Error('Пользователь с таким email или username уже существует'));
              } else {
                reject(err);
              }
            } else {
              resolve({ id: this.lastID, username, email });
            }
          }
        );
      });
    });
  }

  // Поиск пользователя по email
  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Поиск пользователя по ID
  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT id, username, email, created_at FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Проверка пароля
  static async validatePassword(user, password) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
}

module.exports = User;