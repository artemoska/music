// playlist.js - Генератор плейлиста для GitHub Actions
const fs = require('fs');
const path = require('path');

const MUSIC_FOLDER = './music';
const COVERS_FOLDER = './music/covers';
const OUTPUT_FILE = './playlist.json';

function generatePlaylist() {
    console.log('🔍 Сканирую папку с музыкой...');
    
    // Проверяем существование папки
    if (!fs.existsSync(MUSIC_FOLDER)) {
        console.log('Папка music/ не найдена. Создаю...');
        fs.mkdirSync(MUSIC_FOLDER, { recursive: true });
        fs.mkdirSync(COVERS_FOLDER, { recursive: true });
    }
    
    // Получаем список MP3 файлов
    let mp3Files = [];
    try {
        mp3Files = fs.readdirSync(MUSIC_FOLDER)
            .filter(file => file.toLowerCase().endsWith('.mp3'))
            .map(file => ({
                name: file,
                path: path.join(MUSIC_FOLDER, file)
            }));
    } catch (error) {
        console.log('Ошибка чтения папки:', error.message);
        mp3Files = [];
    }
    
    console.log(`🎵 Найдено ${mp3Files.length} MP3 файлов`);
    
    // Получаем список обложек
    const covers = {};
    try {
        const coverFiles = fs.readdirSync(COVERS_FOLDER)
            .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
        
        coverFiles.forEach(file => {
            const nameWithoutExt = file.replace(/\.[^/.]+$/, '').toLowerCase();
            covers[nameWithoutExt] = `${COVERS_FOLDER}/${file}`;
        });
        
        console.log(`🖼️ Найдено ${coverFiles.length} обложек`);
    } catch (error) {
        console.log('Папка с обложками не найдена или пуста');
    }
    
    // Создаём плейлист
    const playlist = mp3Files.map((file, index) => {
        const nameWithoutExt = file.name.replace(/\.mp3$/i, '');
        const fileNameLower = nameWithoutExt.toLowerCase();
        
        // Определяем обложку
        let cover = covers[fileNameLower] || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop';
        
        return {
            id: index + 1,
            name: nameWithoutExt,
            singer: 'Неизвестный исполнитель',
            cover: cover,
            musicSrc: `${MUSIC_FOLDER}/${file.name}`,
            fileName: file.name
        };
    });
    
    // Сохраняем плейлист
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(playlist, null, 2));
    console.log(`✅ Плейлист сохранён в ${OUTPUT_FILE} (${playlist.length} треков)`);
    
    // Также создаём HTML файл для просмотра
    createHtmlList(playlist);
}

function createHtmlList(playlist) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Плейлист - ${playlist.length} треков</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .track { padding: 10px; border-bottom: 1px solid #ccc; }
        .track:nth-child(even) { background: #f5f5f5; }
        .count { color: #666; margin-bottom: 20px; }
    </style>
</head>
<body>
    <h1>Музыкальный плейлист</h1>
    <div class="count">Всего треков: ${playlist.length}</div>
    
    ${playlist.map(track => `
    <div class="track">
        <strong>${track.id}. ${track.name}</strong><br>
        Исполнитель: ${track.singer}<br>
        Файл: ${track.fileName}
    </div>
    `).join('')}
    
    <div style="margin-top: 30px; color: #666; font-size: 0.9em;">
        Автоматически сгенерировано: ${new Date().toLocaleString()}
    </div>
</body>
</html>`;
    
    fs.writeFileSync('./playlist-view.html', html);
    console.log('📄 HTML файл создан: playlist-view.html');
}

// Запускаем генерацию
generatePlaylist();
