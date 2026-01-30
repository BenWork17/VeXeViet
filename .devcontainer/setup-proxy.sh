#!/bin/bash
set -e

# Xóa sạch biến môi trường proxy để không bị can thiệp bởi Docker/Host proxy
unset HTTP_PROXY
unset HTTPS_PROXY
unset http_proxy
unset https_proxy

echo "🔧 Setting up proxy configuration for dev container..."

# 1. Cấu hình npm/pnpm (Tắt proxy khi install)
echo "📦 Clearing npm/pnpm proxy configs..."
npm config delete proxy
npm config delete https-proxy
pnpm config delete proxy || true
pnpm config delete https-proxy || true

# Đảm bảo dùng registry ổn định
npm config set registry "http://registry.npmjs.org/"
pnpm config set registry "http://registry.npmjs.org/"
pnpm config set strict-ssl false

# Cài đặt pnpm
echo "📦 Checking pnpm..."
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm --registry "http://registry.npmjs.org/"
fi

# 2. Cài đặt dependencies (Chạy trực tiếp, VS Code tự handle mạng)
echo "📦 Installing project dependencies..."
pnpm install

# 3. Cấu hình lại proxy cho runtime (Để Amp theo dõi request từ code)
echo "🔧 Configuring proxy for runtime..."
npm config set proxy "http://host.docker.internal:8317"
pnpm config set proxy "http://host.docker.internal:8317"

# 4. Cấu hình git
echo "🔧 Configuring git..."
git config --global http.proxy "http://host.docker.internal:8317"
git config --global https.proxy "http://host.docker.internal:8317"

# 3. Tạo CA certificate cho ProxyPal (nếu cần)
echo "🔐 Setting up SSL certificates..."
mkdir -p /usr/local/share/ca-certificates/

# 4. Cấu hình curl
echo "🌐 Configuring curl..."
cat > ~/.curlrc <<EOF
proxy = "http://host.docker.internal:8317"
insecure
EOF

# 5. Test kết nối
echo ""
echo "✅ Testing proxy connection..."
if curl -I --connect-timeout 5 http://www.google.com > /dev/null 2>&1; then
    echo "✅ HTTP proxy works!"
else
    echo "❌ HTTP proxy failed"
fi

# 6. Cài đặt dependencies
echo ""
echo "📦 Installing project dependencies..."
pnpm install

echo ""
echo "🎉 Proxy setup complete!"
echo ""
echo "Environment variables:"
echo "  HTTP_PROXY:  $HTTP_PROXY"
echo "  HTTPS_PROXY: $HTTPS_PROXY"
echo "  NO_PROXY:    $NO_PROXY"
echo ""
echo "Run 'bash .devcontainer/test-proxy.sh' to verify setup"
