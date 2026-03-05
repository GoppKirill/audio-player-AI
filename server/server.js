const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5002;
const JWT_SECRET = 'your-secret-key-change-this-in-production';

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// ============ БАЗА ДАННЫХ ============
const dbPath = path.join(__dirname, 'database.sqlite');
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
    `, (err) => {
      if (!err) {
        console.log('✅ Таблицы созданы');
      }
    });
  }
});

// ============ ПАПКИ ДЛЯ ЗАГРУЗОК ============
const baseUploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
}

// Статические файлы
app.use('/uploads', express.static(baseUploadDir));

// ============ MIDDLEWARE АВТОРИЗАЦИИ ============
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Нет доступа. Требуется авторизация' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Недействительный токен' });
  }
};

// ============ МАРШРУТЫ АВТОРИЗАЦИИ ============

// Регистрация
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль должен быть минимум 6 символов' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Пользователь с таким email или username уже существует' });
          }
          return res.status(500).json({ error: 'Ошибка базы данных' });
        }
        
        const token = jwt.sign(
          { id: this.lastID, username, email },
          JWT_SECRET,
          { expiresIn: '7d' }
        );
        
        res.status(201).json({
          message: '✅ Пользователь успешно создан',
          user: { id: this.lastID, username, email },
          token
        });
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
});

// Вход
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }
    
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка базы данных' });
      }
      
      if (!user) {
        return res.status(401).json({ error: 'Неверный email или пароль' });
      }
      
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Неверный email или пароль' });
      }
      
      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      res.json({
        message: '✅ Вход выполнен успешно',
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        token
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Ошибка при входе' });
  }
});

// Проверка токена
app.get('/api/auth/verify', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// ============ МАРШРУТЫ ДЛЯ ТРЕКОВ ============

// Настройка multer для загрузки в папку пользователя
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userDir = path.join(baseUploadDir, req.user.id.toString());
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/x-m4a'];
    cb(null, allowedTypes.includes(file.mimetype));
  }
});

// Получить все треки пользователя
app.get('/api/tracks', authMiddleware, (req, res) => {
  db.all(
    'SELECT * FROM tracks WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Ошибка загрузки треков' });
      }
      res.json(rows.map(track => ({
        ...track,
        path: `/uploads/${req.user.id}/${track.filename}`
      })));
    }
  );
});

// Загрузить трек
app.post('/api/tracks', authMiddleware, upload.single('audio'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    const { title, artist } = req.body;
    
    db.run(
      'INSERT INTO tracks (user_id, title, artist, filename, path, size) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, title || req.file.originalname, artist || 'Неизвестный', 
       req.file.filename, `/uploads/${req.user.id}/${req.file.filename}`, req.file.size],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Ошибка сохранения трека' });
        }
        
        res.status(201).json({
          id: this.lastID,
          title: title || req.file.originalname,
          artist: artist || 'Неизвестный',
          filename: req.file.filename,
          path: `/uploads/${req.user.id}/${req.file.filename}`,
          size: req.file.size,
          user_id: req.user.id
        });
      }
    );
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Добавить информацию о треке из плейлиста
app.post('/api/tracks/info', authMiddleware, (req, res) => {
  const { title, artist, source, sourceId } = req.body;
  
  db.run(
    'INSERT INTO tracks (user_id, title, artist, filename, path, size) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, title, artist, `${source}-${sourceId}`, '', 0],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Ошибка сохранения трека' });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Удалить трек
app.delete('/api/tracks/:id', authMiddleware, (req, res) => {
  db.get(
    'SELECT * FROM tracks WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id],
    (err, track) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка базы данных' });
      }
      
      if (!track) {
        return res.status(404).json({ error: 'Трек не найден' });
      }
      
      // Удаляем файл
      if (track.filename && !track.filename.includes('-')) {
        const filePath = path.join(baseUploadDir, req.user.id.toString(), track.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      db.run('DELETE FROM tracks WHERE id = ?', [req.params.id], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Ошибка удаления трека' });
        }
        res.json({ message: '✅ Трек удален' });
      });
    }
  );
});

// ============ ПУБЛИЧНЫЕ МАРШРУТЫ ============

// Проверка сервера
app.get('/', (req, res) => {
  res.json({ 
    message: '✅ Audio Player работает',
    port: PORT,
    version: '2.0.0'
  });
});

// ============ ЗАПУСК ============

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🎵 АУДИО ПЛЕЕР - СЕРВЕР ЗАПУЩЕН');
  console.log('='.repeat(60));
  console.log(`✅ Порт: ${PORT}`);
  console.log(`📁 Uploads: ${baseUploadDir}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`🔐 Авторизация: /api/auth/*`);
  console.log(`🎵 Треки: /api/tracks`);
  console.log('='.repeat(60) + '\n');
});