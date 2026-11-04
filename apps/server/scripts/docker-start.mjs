import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🍵 [Trà Duyên] Đang khởi động hệ thống máy chủ...');

// Auto-sync database schema if running with PostgreSQL
const dbUrl = process.env.DATABASE_URL || '';
if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
  console.log('🔄 Đang kiểm tra và đồng bộ cấu trúc PostgreSQL...');
  let connected = false;
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      execSync('npx prisma db push --accept-data-loss', {
        cwd: path.resolve(__dirname, '..'),
        stdio: 'inherit'
      });
      console.log('✅ Cơ sở dữ liệu PostgreSQL đã sẵn sàng!');
      connected = true;
      break;
    } catch (err) {
      console.warn(`⏳ Đang đợi PostgreSQL sẵn sàng (lần thử ${attempt}/6)...`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
  if (!connected) {
    console.error('⚠️ Không thể đồng bộ PostgreSQL sau 6 lần thử. Vẫn khởi động máy chủ để chẩn đoán.');
  }
} else {
  console.log('ℹ️ Chế độ cơ sở dữ liệu nội bộ/SQLite.');
}

// Start main application
const entrypoint = path.resolve(__dirname, '../dist/index.js');
await import(`file://${entrypoint.replace(/\\/g, '/')}`);
