const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const authMiddleware = require('../middleware/auth');
const db = require('../models/User'); // Используем ту же БД

// Настройка multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userDir = path.join(__dirname, '../uploads', req.user.id.toString());
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + crypto.randomBytes(8).toString('hex') + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a'];
    cb(null, allowedTypes.includes(file.mimetype));
  }
});

// Получить все треки пользователя
router.get('/', authMiddleware, async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Загрузить трек
router.post('/', authMiddleware, upload.single('audio'), async (req, res) => {
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
          size: req.file.size
        });
      }
    );
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Удалить трек
router.delete('/:id', authMiddleware, (req, res) => {
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
      const filePath = path.join(__dirname, '../uploads', req.user.id.toString(), track.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Удаляем запись из БД
      db.run('DELETE FROM tracks WHERE id = ?', [req.params.id], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Ошибка удаления трека' });
        }
        res.json({ message: '✅ Трек удален' });
      });
    }
  );
});

module.exports = router;