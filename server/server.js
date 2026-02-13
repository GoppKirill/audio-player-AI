const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5002;

// Разрешаем всё
app.use(cors({ origin: '*' }));
app.use(express.json());

// СОЗДАЕМ ПАПКУ UPLOADS
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('✅ Папка uploads создана');
}

// СТАТИЧЕСКИЕ ФАЙЛЫ
app.use('/uploads', express.static(uploadDir));

// НАСТРОЙКА MULTER - УПРОЩЕННАЯ
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }
});

// ХРАНИЛИЩЕ ТРЕКОВ
let tracks = [
        {
        id: '1',
        title: 'Тестовый трек 3',
        artist: 'Sample Artist',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
    }
];

// ============ МАРШРУТЫ ============

// 1. ПРОВЕРКА СЕРВЕРА
app.get('/', (req, res) => {
    res.json({ 
        message: '✅ Audio Player работает',
        port: PORT,
        tracksCount: tracks.length
    });
});

// 2. ПОЛУЧИТЬ ВСЕ ТРЕКИ
app.get('/tracks', (req, res) => {
    res.json(tracks);
});

// 3. ЗАГРУЗИТЬ ТРЕК - ЭТОТ МАРШРУТ ВАЖЕН!
app.post('/tracks', upload.single('audio'), (req, res) => {
    console.log('\n=== ПОЛУЧЕН POST /tracks ===');
    console.log('Тело запроса:', req.body);
    console.log('Файл:', req.file ? req.file.originalname : 'НЕТ ФАЙЛА');
    
    if (!req.file) {
        return res.status(400).json({ error: 'Файл не найден' });
    }

    const track = {
        id: Date.now().toString(),
        title: req.body.title || req.file.originalname,
        artist: req.body.artist || 'Неизвестный',
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
        size: req.file.size,
        createdAt: new Date().toISOString()
    };

    tracks.push(track);
    console.log('✅ Трек добавлен:', track.title);
    console.log('📁 Файл сохранен:', req.file.filename);
    console.log('========================\n');
    
    res.status(201).json(track);
});

// 4. УДАЛИТЬ ТРЕК
app.delete('/tracks/:id', (req, res) => {
    const index = tracks.findIndex(t => t.id === req.params.id);
    if (index !== -1) {
        const track = tracks[index];
        const filePath = path.join(uploadDir, track.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        tracks.splice(index, 1);
        res.json({ message: '✅ Трек удален' });
    } else {
        res.status(404).json({ error: 'Трек не найден' });
    }
});

// 5. DEBUG - ПРОВЕРКА ФАЙЛОВ
app.get('/debug', (req, res) => {
    try {
        const files = fs.existsSync(uploadDir) ? fs.readdirSync(uploadDir) : [];
        res.json({
            server: 'online',
            port: PORT,
            uploadsPath: uploadDir,
            files: files,
            tracks: tracks
        });
    } catch (error) {
        res.json({ error: error.message });
    }
});

// ЗАПУСК
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🎵 АУДИО ПЛЕЕР - СЕРВЕР ЗАПУЩЕН');
    console.log('='.repeat(60));
    console.log(`✅ Порт: ${PORT}`);
    console.log(`📁 Uploads: ${uploadDir}`);
    console.log(`🔍 Debug: http://localhost:${PORT}/debug`);
    console.log(`📤 POST /tracks - загрузка треков`);
    console.log('='.repeat(60) + '\n');
});