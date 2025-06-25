#!/bin/bash

# Docker Management Script for KijayKolder LinksHub
# This script helps manage Docker for local development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker_installed() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first:"
        echo "   https://docs.docker.com/get-docker/"
        exit 1
    fi
    print_success "Docker is installed"
}

# Check if Docker is running
check_docker_running() {
    if docker info &> /dev/null; then
        print_success "Docker is running"
        return 0
    else
        print_warning "Docker is not running"
        return 1
    fi
}

# Start Docker based on OS
start_docker() {
    print_status "Attempting to start Docker..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS - try to start Docker Desktop
        if [ -d "/Applications/Docker.app" ]; then
            print_status "Starting Docker Desktop..."
            open -a Docker
        elif [ -d "/Applications/Docker Desktop.app" ]; then
            print_status "Starting Docker Desktop..."
            open -a "Docker Desktop"
        else
            print_error "Docker Desktop not found. Please install Docker Desktop manually."
            exit 1
        fi
        
        # Wait for Docker to start
        print_status "Waiting for Docker to start..."
        for i in {1..30}; do
            if docker info &> /dev/null; then
                print_success "Docker is now running"
                return 0
            fi
            if [ $i -eq 30 ]; then
                print_error "Docker failed to start within 30 seconds. Please start Docker manually and try again."
                exit 1
            fi
            sleep 1
        done
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux - try to start Docker service
        print_status "Starting Docker service..."
        sudo systemctl start docker
        
        # Wait for Docker to start
        print_status "Waiting for Docker to start..."
        for i in {1..10}; do
            if docker info &> /dev/null; then
                print_success "Docker is now running"
                return 0
            fi
            if [ $i -eq 10 ]; then
                print_error "Docker failed to start. Please check Docker service and try again."
                exit 1
            fi
            sleep 1
        done
    else
        print_error "Unsupported operating system for Docker auto-start. Please start Docker manually."
        exit 1
    fi
}

# Stop Docker containers
stop_containers() {
    print_status "Stopping Docker containers..."
    docker stop $(docker ps -q) 2>/dev/null || print_warning "No running containers to stop"
    print_success "Docker containers stopped"
}

# Clean up Docker resources
cleanup_docker() {
    print_status "Cleaning up Docker resources..."
    
    # Stop containers
    docker stop $(docker ps -aq) 2>/dev/null || true
    
    # Remove containers
    docker rm $(docker ps -aq) 2>/dev/null || true
    
    # Remove unused images
    docker image prune -f 2>/dev/null || true
    
    # Remove unused volumes
    docker volume prune -f 2>/dev/null || true
    
    # Remove unused networks
    docker network prune -f 2>/dev/null || true
    
    print_success "Docker cleanup completed"
}

# Show Docker status
show_status() {
    print_status "Docker Status:"
    echo "=============="
    
    if check_docker_running; then
        echo ""
        print_status "Running containers:"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "No running containers"
        
        echo ""
        print_status "Docker system info:"
        docker system df 2>/dev/null || echo "Unable to get system info"
    else
        print_error "Docker is not running"
    fi
}

# Main script logic
case "${1:-status}" in
    "start")
        check_docker_installed
        if ! check_docker_running; then
            start_docker
        else
            print_success "Docker is already running"
        fi
        ;;
    "stop")
        check_docker_installed
        if check_docker_running; then
            stop_containers
        else
            print_warning "Docker is not running"
        fi
        ;;
    "restart")
        check_docker_installed
        if check_docker_running; then
            stop_containers
        fi
        start_docker
        ;;
    "cleanup")
        check_docker_installed
        if check_docker_running; then
            cleanup_docker
        else
            print_warning "Docker is not running"
        fi
        ;;
    "status")
        check_docker_installed
        show_status
        ;;
    "health")
        check_docker_installed
        if check_docker_running; then
            print_success "Docker is healthy and ready"
        else
            print_error "Docker is not running"
            exit 1
        fi
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|cleanup|status|health}"
        echo ""
        echo "Commands:"
        echo "  start    - Start Docker if not running"
        echo "  stop     - Stop all running containers"
        echo "  restart  - Restart Docker"
        echo "  cleanup  - Clean up unused Docker resources"
        echo "  status   - Show Docker status (default)"
        echo "  health   - Check if Docker is healthy"
        exit 1
        ;;
esac 