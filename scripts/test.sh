#!/bin/bash

# Test Runner Script for KijayKolder LinksHub
# This script runs different types of tests with proper setup

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

# Check if dependencies are installed
check_dependencies() {
    print_status "Checking test dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if [ ! -f "node_modules/.bin/vitest" ]; then
        print_warning "Test dependencies not installed. Installing..."
        npm install
    fi
    
    print_success "Dependencies ready"
}

# Run unit tests
run_unit_tests() {
    print_status "Running unit tests..."
    
    if [ -f "node_modules/.bin/vitest" ]; then
        npx vitest run --config vitest.config.ts tests/unit/
        print_success "Unit tests completed"
    else
        print_error "Vitest not found. Please run 'npm install' first"
        exit 1
    fi
}

# Run database tests (requires Supabase running)
run_db_tests() {
    print_status "Running database tests..."
    
    # Check if Supabase is running
    if ! supabase status &> /dev/null; then
        print_warning "Supabase not running. Starting Supabase..."
        npm run supabase:start
    fi
    
    if [ -f "node_modules/.bin/vitest" ]; then
        npx vitest run --config vitest.db.config.ts tests/db/
        print_success "Database tests completed"
    else
        print_error "Vitest not found. Please run 'npm install' first"
        exit 1
    fi
}

# Run API tests
run_api_tests() {
    print_status "Running API tests..."
    
    if [ -f "node_modules/.bin/vitest" ]; then
        npx vitest run --config vitest.api.config.ts tests/api/
        print_success "API tests completed"
    else
        print_error "Vitest not found. Please run 'npm install' first"
        exit 1
    fi
}

# Run all tests
run_all_tests() {
    print_status "Running all tests..."
    
    check_dependencies
    
    # Run unit tests first
    run_unit_tests
    
    # Run database tests if Supabase is available
    if command -v supabase &> /dev/null; then
        run_db_tests
    else
        print_warning "Supabase CLI not found. Skipping database tests"
    fi
    
    # Run API tests
    run_api_tests
    
    print_success "All tests completed!"
}

# Run tests with coverage
run_coverage() {
    print_status "Running tests with coverage..."
    
    check_dependencies
    
    if [ -f "node_modules/.bin/vitest" ]; then
        npx vitest run --coverage
        print_success "Coverage report generated"
    else
        print_error "Vitest not found. Please run 'npm install' first"
        exit 1
    fi
}

# Run tests in watch mode
run_watch() {
    print_status "Running tests in watch mode..."
    
    check_dependencies
    
    if [ -f "node_modules/.bin/vitest" ]; then
        npx vitest --watch
    else
        print_error "Vitest not found. Please run 'npm install' first"
        exit 1
    fi
}

# Main script logic
case "${1:-all}" in
    "unit")
        check_dependencies
        run_unit_tests
        ;;
    "db")
        check_dependencies
        run_db_tests
        ;;
    "api")
        check_dependencies
        run_api_tests
        ;;
    "coverage")
        run_coverage
        ;;
    "watch")
        run_watch
        ;;
    "all")
        run_all_tests
        ;;
    *)
        echo "Usage: $0 {unit|db|api|coverage|watch|all}"
        echo ""
        echo "Commands:"
        echo "  unit      - Run unit tests only"
        echo "  db        - Run database tests (requires Supabase)"
        echo "  api       - Run API tests"
        echo "  coverage  - Run all tests with coverage report"
        echo "  watch     - Run tests in watch mode"
        echo "  all       - Run all tests (default)"
        exit 1
        ;;
esac 