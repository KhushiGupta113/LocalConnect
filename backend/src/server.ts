import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

async function bootstrap() {
  await connectDB();
  const app = createApp();

  const PORT = Number(env.PORT) || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 LocalConnect Backend server running on http://localhost:${PORT}`);
    console.log(`📡 Health endpoint: http://localhost:${PORT}/health`);
    console.log(`🔌 API base: http://localhost:${PORT}/api/v1`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});

