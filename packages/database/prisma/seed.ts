import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AniTech database...');

  // Create default achievements
  const achievements = [
    { name: 'WATCHLIST_10', description: 'Add 10 anime to your watchlist', category: 'COLLECTION' as const, icon: '📚', points: 10, rarity: 'COMMON' as const, condition: { type: 'watchlist_count', target: 10 } },
    { name: 'WATCHLIST_50', description: 'Add 50 anime to your watchlist', category: 'COLLECTION' as const, icon: '📚', points: 50, rarity: 'UNCOMMON' as const, condition: { type: 'watchlist_count', target: 50 } },
    { name: 'COMPLETED_5', description: 'Complete 5 anime', category: 'WATCHING' as const, icon: '✅', points: 20, rarity: 'COMMON' as const, condition: { type: 'completed_count', target: 5 } },
    { name: 'COMPLETED_25', description: 'Complete 25 anime', category: 'WATCHING' as const, icon: '✅', points: 100, rarity: 'RARE' as const, condition: { type: 'completed_count', target: 25 } },
    { name: 'RATER_10', description: 'Rate 10 anime', category: 'SOCIAL' as const, icon: '⭐', points: 15, rarity: 'COMMON' as const, condition: { type: 'rating_count', target: 10 } },
    { name: 'MARATHONER', description: 'Watch 100 episodes total', category: 'WATCHING' as const, icon: '🏃', points: 50, rarity: 'RARE' as const, condition: { type: 'episode_count', target: 100 } },
    { name: 'NIGHT_OWL', description: 'Watch anime past midnight for 7 days', category: 'WATCHING' as const, icon: '🦉', points: 30, rarity: 'UNCOMMON' as const, condition: { type: 'night_owl', target: 7 } },
    { name: 'SOCIAL_BUTTERFLY', description: 'Make 10 friends', category: 'SOCIAL' as const, icon: '🦋', points: 25, rarity: 'UNCOMMON' as const, condition: { type: 'friend_count', target: 10 } },
    { name: 'PARTY_HOST', description: 'Host 5 watch parties', category: 'SOCIAL' as const, icon: '🎉', points: 40, rarity: 'RARE' as const, condition: { type: 'party_count', target: 5 } },
    { name: 'PLUGIN_MASTER', description: 'Install 10 plugins', category: 'COMMUNITY' as const, icon: '🔌', points: 20, rarity: 'UNCOMMON' as const, condition: { type: 'plugin_count', target: 10 } },
    { name: 'THEME_ARTIST', description: 'Create a custom theme', category: 'COMMUNITY' as const, icon: '🎨', points: 15, rarity: 'COMMON' as const, condition: { type: 'theme_count', target: 1 } },
    { name: 'COMPLETIONIST', description: 'Complete 50 anime', category: 'WATCHING' as const, icon: '🏆', points: 200, rarity: 'LEGENDARY' as const, condition: { type: 'completed_count', target: 50 } },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: {},
      create: achievement,
    });
  }
  console.log(`  ${achievements.length} achievements seeded`);

  // Create default genres
  const genreNames = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mecha',
    'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural',
    'Thriller', 'Psychological', 'Historical', 'Music', 'Martial Arts',
    'Ecchi', 'Harem', 'Isekai', 'Shounen', 'Shoujo', 'Seinen', 'Josei',
    'Kids', 'Military', 'Parody', 'School', 'Space',
  ];

  for (const name of genreNames) {
    await prisma.genre.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`  ${genreNames.length} genres seeded`);

  // Create default plugins
  const plugins = [
    { name: 'GogoAnime', version: '1.0.0', author: 'AniTech', description: 'Stream from GogoAnime sources', icon: 'gogo.png', isOfficial: true, isEnabled: true, entryPoint: 'gogoanime', manifest: { type: 'STREAMING_PROVIDER' }, permissions: ['STREAMING'] },
    { name: 'Zoro', version: '1.0.0', author: 'AniTech', description: 'Stream from Zoro sources', icon: 'zoro.png', isOfficial: true, isEnabled: true, entryPoint: 'zoro', manifest: { type: 'STREAMING_PROVIDER' }, permissions: ['STREAMING'] },
    { name: 'AniList Sync', version: '1.0.0', author: 'AniTech', description: 'Sync watchlist with AniList', icon: 'anilist.png', isOfficial: true, isEnabled: true, entryPoint: 'anilist-sync', manifest: { type: 'SYNC' }, permissions: ['SYNC'] },
    { name: 'MyAnimeList Sync', version: '1.0.0', author: 'AniTech', description: 'Sync watchlist with MyAnimeList', icon: 'mal.png', isOfficial: true, isEnabled: false, entryPoint: 'mal-sync', manifest: { type: 'SYNC' }, permissions: ['SYNC'] },
    { name: 'Subtitle Downloader', version: '1.0.0', author: 'AniTech', description: 'Auto-download subtitles', icon: 'subs.png', isOfficial: true, isEnabled: true, entryPoint: 'subs', manifest: { type: 'UTILITY' }, permissions: ['SUBTITLES'] },
    { name: 'Metadata Enricher', version: '1.0.0', author: 'AniTech', description: 'Fetch extended metadata from AniDB', icon: 'metadata.png', isOfficial: true, isEnabled: true, entryPoint: 'metadata', manifest: { type: 'UTILITY' }, permissions: ['METADATA'] },
    { name: 'Simkl Tracker', version: '1.0.0', author: 'Community', description: 'Sync watch history with Simkl', icon: 'simkl.png', isOfficial: false, isEnabled: false, entryPoint: 'simkl', manifest: { type: 'SYNC' }, permissions: ['SYNC'] },
    { name: 'Discord Rich Presence', version: '1.0.0', author: 'AniTech', description: 'Show what you are watching on Discord', icon: 'discord.png', isOfficial: true, isEnabled: false, entryPoint: 'discord-rpc', manifest: { type: 'INTEGRATION' }, permissions: ['INTEGRATION'] },
    { name: 'Torrent Search', version: '1.0.0', author: 'Community', description: 'Search torrents for anime', icon: 'torrent.png', isOfficial: false, isEnabled: false, entryPoint: 'torrent', manifest: { type: 'UTILITY' }, permissions: ['SEARCH'] },
    { name: 'FanArt Provider', version: '1.0.0', author: 'Community', description: 'Alternative streaming sources', icon: 'fanart.png', isOfficial: false, isEnabled: false, entryPoint: 'fanart', manifest: { type: 'STREAMING_PROVIDER' }, permissions: ['STREAMING'] },
  ];

  // Check for existing plugins by name to avoid duplicates
  const existingPluginNames = new Set((await prisma.plugin.findMany({ select: { name: true } })).map(p => p.name));
  for (const plugin of plugins) {
    if (!existingPluginNames.has(plugin.name)) {
      await prisma.plugin.create({ data: plugin });
    }
  }
  console.log(`  ${plugins.length} plugins seeded`);

  // Create default themes
  const themes = [
    { name: 'AniTech Dark', description: 'Default dark theme', colors: { primary: '#7C3AED', background: '#0F0F1A', surface: '#1A1A2E', text: '#E2E8F0' }, isDefault: true, isPublic: true },
    { name: 'AniTech Light', description: 'Default light theme', colors: { primary: '#7C3AED', background: '#F8FAFC', surface: '#FFFFFF', text: '#1E293B' }, isDefault: false, isPublic: true },
    { name: 'Synthwave', description: 'Retro synthwave aesthetic', colors: { primary: '#FF6B9D', background: '#1A0B2E', surface: '#2D1B4E', text: '#E0B0FF' }, isDefault: false, isPublic: true },
    { name: 'Forest', description: 'Calming forest greens', colors: { primary: '#2ECC71', background: '#0D1F12', surface: '#1A3A22', text: '#A8E6CF' }, isDefault: false, isPublic: true },
    { name: 'Midnight', description: 'Deep blue midnight theme', colors: { primary: '#60A5FA', background: '#0A0A1A', surface: '#141428', text: '#C4D4F0' }, isDefault: false, isPublic: true },
  ];

  const existingThemeNames = new Set((await prisma.theme.findMany({ select: { name: true } })).map(t => t.name));
  for (const theme of themes) {
    if (!existingThemeNames.has(theme.name)) {
      await prisma.theme.create({ data: theme });
    }
  }
  console.log(`  ${themes.length} themes seeded`);

  // Create admin user
  const { hash } = await import('argon2');
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await hash(adminPassword);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@anitech.app',
      passwordHash: hashedPassword,
      displayName: 'Admin',
      role: 'ADMIN',
    },
  });

  // Create default settings for admin
  await prisma.userSettings.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id },
  });

  console.log(`  Admin user created (username: admin, password: ${adminPassword})`);

  // Create demo user
  const demoPassword = await hash('demo123');
  const demo = await prisma.user.upsert({
    where: { username: 'demo' },
    update: {},
    create: {
      username: 'demo',
      email: 'demo@anitech.app',
      passwordHash: demoPassword,
      displayName: 'Demo User',
      role: 'USER',
    },
  });

  // Create default settings for demo
  await prisma.userSettings.upsert({
    where: { userId: demo.id },
    update: {},
    create: { userId: demo.id },
  });

  console.log(`  Demo user created (username: demo, password: demo123)`);

  // Assign default theme to admin
  const defaultTheme = await prisma.theme.findFirst({ where: { name: 'AniTech Dark' } });
  if (defaultTheme) {
    await prisma.theme.update({
      where: { id: defaultTheme.id },
      data: { isActive: true, userId: admin.id },
    });
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
