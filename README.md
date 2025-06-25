# KijayKolder LinksHub - Music Player

A modern music player built with Next.js, Supabase, and NextUI, featuring real-time updates, drag-and-drop file uploads, and automatic metadata extraction.

## 🚀 Features

### Core Features

- **Cloud Storage**: Audio files stored in Supabase with CDN for fast loading
- **Real-time Updates**: Live synchronization between admin panel and player
- **Drag & Drop Upload**: Intuitive file upload interface with progress tracking
- **Metadata Extraction**: Automatic extraction of title, artist, album, duration, and cover art
- **Waveform Visualization**: Generated waveform data for audio visualization
- **Background Videos**: Support for background video content
- **Responsive Design**: Beautiful UI that works on all devices

### Admin Panel Features

- **Bulk Operations**: Select and manage multiple tracks at once
- **File Management**: Upload, edit, and delete audio/video files
- **Metadata Editing**: Manual override of extracted metadata
- **Active/Inactive Toggle**: Control which tracks are visible to users
- **Statistics Dashboard**: Overview of content and usage
- **Real-time Sync**: Changes appear instantly across all connected clients

### Player Features

- **Swipe Navigation**: Swipe left/right to change tracks
- **Playback Controls**: Play/pause, seek, and progress tracking
- **Cover Art Display**: Album artwork with fallback icons
- **Track Information**: Title, artist, album, and duration display
- **Background Videos**: Optional video backgrounds for enhanced experience

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Framework**: NextUI v2, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Storage, Real-time)
- **Audio Processing**: music-metadata, music-metadata-browser
- **Deployment**: Vercel (frontend), Supabase (backend)

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/KijayKolder-LinksHub.git
   cd KijayKolder-LinksHub
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Supabase**

   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Start local Supabase
   supabase start
   ```

4. **Configure environment variables**
   Create a `.env.local` file:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-supabase-start
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

## 🗄 Database Schema

### Tracks Table

```sql
CREATE TABLE tracks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  album VARCHAR(255),
  duration INTEGER, -- in seconds
  file_url TEXT NOT NULL,
  file_size BIGINT,
  cover_image_url TEXT,
  waveform_data JSONB, -- Store waveform visualization data
  metadata JSONB, -- Additional metadata (bitrate, format, etc.)
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Background Videos Table

```sql
CREATE TABLE background_videos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  thumbnail_url TEXT,
  duration INTEGER, -- in seconds
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🎵 File Storage

### Storage Buckets

- **audio**: MP3, FLAC, WAV, OGG, AAC files (100MB limit)
- **videos**: MP4, WebM, OGG, QuickTime files (500MB limit)
- **images**: PNG, JPEG, GIF, WebP files (10MB limit)

### File Organization

```
audio/
├── timestamp_filename.mp3
├── timestamp_filename.flac
└── ...

videos/
├── timestamp_filename.mp4
├── timestamp_filename.webm
└── ...

images/
├── covers/
│   ├── track_id_timestamp.jpg
│   └── ...
└── thumbnails/
    ├── video_id_timestamp.jpg
    └── ...
```

## 🔧 API Endpoints

### Supabase Functions

- **extract-metadata**: Server-side metadata extraction and waveform generation

### Next.js API Routes

- **/api/extract-metadata**: Proxy to Supabase function for metadata extraction

### Supabase API

- **tracks**: CRUD operations for track management
- **background_videos**: CRUD operations for video management
- **storage**: File upload/download operations

## 🎨 UI Components

### Core Components

- `MusicPlayerCard`: Main player interface with swipe navigation
- `MetadataAudioPlayer`: Audio player with metadata display
- `BackgroundVideo`: Video background component
- `EntranceAnimation`: Loading and transition animations

### Admin Components

- Drag & drop upload zone
- Progress indicators
- Bulk selection interface
- Statistics dashboard

## 🚀 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Supabase)

1. Create a new Supabase project
2. Run migrations: `supabase db push`
3. Deploy functions: `supabase functions deploy`
4. Configure storage buckets and policies

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🔒 Security

### Row Level Security (RLS)

- Public read access for active tracks and videos
- Admin full access (requires authentication setup)
- Storage bucket policies for file access control

### File Upload Security

- MIME type validation
- File size limits
- Secure file naming with timestamps
- CDN delivery for performance

## 📊 Performance Optimizations

### Caching Strategy

- Browser cache for static assets
- Supabase CDN for file delivery
- Client-side caching for metadata
- Optimistic UI updates

### Loading Optimizations

- Lazy loading of audio files
- Progressive metadata loading
- Background video preloading
- Efficient waveform generation

## 🧪 Testing

### Manual Testing

1. Upload audio files via drag & drop
2. Verify metadata extraction
3. Test real-time updates
4. Check responsive design
5. Validate file type restrictions

### Automated Testing

```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Build test
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Check the [Supabase documentation](https://supabase.com/docs)
- Review the [Next.js documentation](https://nextjs.org/docs)

## 🎯 Roadmap

### Phase 1: Core Features ✅

- [x] Supabase integration
- [x] File upload and storage
- [x] Metadata extraction
- [x] Real-time updates
- [x] Admin panel

### Phase 2: Enhanced Features 🚧

- [ ] User authentication
- [ ] Playlists and collections
- [ ] Advanced audio controls
- [ ] Mobile app
- [ ] Analytics dashboard

### Phase 3: Advanced Features 📋

- [ ] AI-powered recommendations
- [ ] Social features
- [ ] Multi-language support
- [ ] Advanced audio processing
- [ ] Integration with music services

---

Built with ❤️ using Next.js and Supabase
