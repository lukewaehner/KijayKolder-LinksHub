# 🚀 Quick Start Guide

Get your music player up and running in 5 minutes!

## Prerequisites

- Node.js 18+
- npm or yarn
- Git

## Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/KijayKolder-LinksHub.git
cd KijayKolder-LinksHub

# Run the automated setup script
npm run setup
```

The setup script will:

- ✅ Install all dependencies
- ✅ Install Supabase CLI
- ✅ Create environment configuration
- ✅ Start Supabase locally
- ✅ Deploy database schema
- ✅ Deploy metadata extraction function

## Option 2: Manual Setup

If you prefer to set up manually or the automated script fails:

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Supabase CLI

```bash
# macOS (using Homebrew)
brew install supabase/tap/supabase

# Or download directly
curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_darwin_amd64.tar.gz | tar -xz
sudo mv supabase /usr/local/bin/
```

### 3. Create Environment File

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-supabase-start
```

### 4. Start Supabase

```bash
npm run supabase:start
```

### 5. Deploy Database

```bash
npm run supabase:push
npm run supabase:functions:deploy
```

### 6. Start Development Server

```bash
npm run dev
```

## 🎵 Using the Music Player

### Access Points

- **Music Player**: http://localhost:3000/music-player
- **Admin Panel**: http://localhost:3000/admin
- **Supabase Studio**: http://localhost:54323

### Quick Test

1. Go to the admin panel
2. Drag and drop an audio file (MP3, FLAC, etc.)
3. Watch the metadata extraction in action
4. Go to the music player to test playback

## 🛠 Common Commands

```bash
# Development
npm run dev                    # Start development server
npm run build                 # Build for production
npm run lint                  # Run ESLint
npm run type-check           # TypeScript type checking

# Docker Management
npm run docker               # Show Docker management help
npm run docker:start         # Start Docker if not running
npm run docker:stop          # Stop all Docker containers
npm run docker:restart       # Restart Docker
npm run docker:cleanup       # Clean up unused Docker resources
npm run docker:status        # Show Docker status
npm run docker:health        # Check Docker health

# Supabase Management
npm run supabase:start       # Start Supabase (auto-starts Docker)
npm run supabase:stop        # Stop Supabase
npm run supabase:status      # Check Supabase status
npm run supabase:push        # Deploy database changes
npm run supabase:studio      # Open Supabase Studio

# Database
npm run supabase:reset       # Reset database (⚠️ destructive)
npm run supabase:pull        # Pull remote schema changes
npm run supabase:diff        # Show schema differences
```

## 🔧 Troubleshooting

### Docker Issues

```bash
# Check Docker status
npm run docker:status

# Start Docker if not running
npm run docker:start

# Restart Docker if having issues
npm run docker:restart

# Clean up Docker resources
npm run docker:cleanup

# Check Docker health
npm run docker:health
```

### Supabase CLI Issues

```bash
# If Supabase CLI installation fails
brew install supabase/tap/supabase

# Or use the direct download method
curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_darwin_amd64.tar.gz | tar -xz
sudo mv supabase /usr/local/bin/
```

### Port Conflicts

If ports are already in use:

```bash
# Check what's using the ports
lsof -i :54321  # Supabase API
lsof -i :54322  # Supabase Database
lsof -i :54323  # Supabase Studio
lsof -i :3000   # Next.js

# Kill processes if needed
kill -9 <PID>
```

### Database Issues

```bash
# Reset everything and start fresh
npm run supabase:stop
npm run supabase:reset
npm run supabase:start
npm run supabase:push
```

### Build Issues

```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

## 📱 Next Steps

1. **Upload Music**: Use the admin panel to upload your audio files
2. **Customize**: Modify the UI components in `/components`
3. **Add Features**: Extend the functionality in `/app`
4. **Deploy**: Follow the deployment guide in the main README

## 🆘 Need Help?

- Check the [main README](README.md) for detailed documentation
- Review [Supabase docs](https://supabase.com/docs)
- Create an issue on GitHub

---

Happy coding! 🎵
