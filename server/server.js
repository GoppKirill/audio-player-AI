const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Создаем папку для загрузок
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Статические файлы
app.use('/uploads', express.static(uploadDir));

// Настройка Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = crypto.randomBytes(16).toString('hex') + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Только аудио файлы разрешены!'));
        }
    },
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    }
});

// Хранилище треков (в реальном проекте замените на БД)
let tracks = [];

// ============= ROUTES =============

// Проверка сервера
app.get('/', (req, res) => {
    res.json({ 
        status: 'online',
        message: 'Audio Player API работает!',
        time: new Date().toLocaleString()
    });
});

// Получить все треки
app.get('/api/tracks', (req, res) => {
    res.json(tracks);
});

// Загрузить трек
app.post('/api/tracks', upload.single('audio'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Файл не загружен' });
        }

        const track = {
            id: crypto.randomBytes(8).toString('hex'),
            title: req.body.title || req.file.originalname.replace(path.extname(req.file.originalname), ''),
            artist: req.body.artist || 'Неизвестный исполнитель',
            filename: req.file.filename,
            path: `/uploads/${req.file.filename}`,
            size: req.file.size,
            mimetype: req.file.mimetype,
            createdAt: new Date().toISOString()
        };

        tracks.push(track);
        res.status(201).json(track);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Удалить трек
app.delete('/api/tracks/:id', (req, res) => {
    const trackIndex = tracks.findIndex(t => t.id === req.params.id);
    
    if (trackIndex === -1) {
        return res.status(404).json({ error: 'Трек не найден' });
    }

    const track = tracks[trackIndex];
    const filePath = path.join(uploadDir, track.filename);
    
    // Удаляем файл
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
    
    // Удаляем из массива
    tracks.splice(trackIndex, 1);
    
    res.json({ message: 'Трек удален' });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🎵 AUDIO PLAYER SERVER');
    console.log('='.repeat(50));
    console.log(`✅ Сервер запущен: http://localhost:${PORT}`);
    console.log(`📁 Загрузки: ${uploadDir}`);
    console.log('='.repeat(50) + '\n');
});