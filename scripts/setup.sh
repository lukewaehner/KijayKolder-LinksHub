#!/bin/bash

# KijayKolder LinksHub - Music Player Setup Script
# This script helps set up the development environment

set -e

echo "🎵 Setting up KijayKolder LinksHub Music Player..."
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

echo "✅ Docker detected"

# Check if Docker is running and start it if not
if ! docker info &> /dev/null; then
    echo "🐳 Docker is not running. Attempting to start Docker..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS - try to start Docker Desktop
        if [ -d "/Applications/Docker.app" ]; then
            echo "Starting Docker Desktop..."
            open -a Docker
        elif [ -d "/Applications/Docker Desktop.app" ]; then
            echo "Starting Docker Desktop..."
            open -a "Docker Desktop"
        else
            echo "❌ Docker Desktop not found. Please start Docker manually."
            exit 1
        fi
        
        # Wait for Docker to start
        echo "⏳ Waiting for Docker to start..."
        for i in {1..30}; do
            if docker info &> /dev/null; then
                echo "✅ Docker is now running"
                break
            fi
            if [ $i -eq 30 ]; then
                echo "❌ Docker failed to start within 30 seconds. Please start Docker manually and try again."
                exit 1
            fi
            sleep 1
        done
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux - try to start Docker service
        echo "Starting Docker service..."
        sudo systemctl start docker
        
        # Wait for Docker to start
        echo "⏳ Waiting for Docker to start..."
        for i in {1..10}; do
            if docker info &> /dev/null; then
                echo "✅ Docker is now running"
                break
            fi
            if [ $i -eq 10 ]; then
                echo "❌ Docker failed to start. Please check Docker service and try again."
                exit 1
            fi
            sleep 1
        done
    else
        echo "❌ Unsupported operating system for Docker auto-start. Please start Docker manually."
        exit 1
    fi
else
    echo "✅ Docker is already running"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "📦 Installing Supabase CLI..."
    
    # Try Homebrew first (macOS/Linux)
    if command -v brew &> /dev/null; then
        echo "Using Homebrew to install Supabase CLI..."
        brew install supabase/tap/supabase
    else
        # Fallback to direct download
        echo "Downloading Supabase CLI directly..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_darwin_amd64.tar.gz | tar -xz
            sudo mv supabase /usr/local/bin/
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
            sudo mv supabase /usr/local/bin/
        else
            echo "❌ Unsupported operating system. Please install Supabase CLI manually:"
            echo "   https://github.com/supabase/cli#install-the-cli"
            exit 1
        fi
    fi
fi

echo "✅ Supabase CLI installed"

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "🔧 Creating .env.local file..."
    cat > .env.local << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-will-be-set-after-supabase-start

# Optional: Production settings (uncomment when deploying)
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
EOF
    echo "✅ .env.local created"
else
    echo "✅ .env.local already exists"
fi

# Start Supabase
echo "🚀 Starting Supabase..."
supabase start

# Get the anon key and update .env.local
ANON_KEY=$(supabase status --output json | grep -o '"anon_key":"[^"]*"' | cut -d'"' -f4)
if [ ! -z "$ANON_KEY" ]; then
    sed -i.bak "s/your-anon-key-will-be-set-after-supabase-start/$ANON_KEY/" .env.local
    rm .env.local.bak
    echo "✅ Updated .env.local with Supabase anon key"
fi

# Deploy database schema
echo "🗄️ Deploying database schema..."
supabase db push

# Deploy functions
echo "⚡ Deploying Supabase functions..."
supabase functions deploy extract-metadata

echo ""
echo "🎉 Setup complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Run 'npm run dev' to start the development server"
echo "2. Open http://localhost:3000 to view the music player"
echo "3. Open http://localhost:3000/admin to access the admin panel"
echo "4. Open http://localhost:54323 to access Supabase Studio"
echo ""
echo "Happy coding! 🎵" 