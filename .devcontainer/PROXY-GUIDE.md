# Hướng dẫn Kết nối Dev Container với ProxyPal & Ampcode

Tài liệu này hướng dẫn cách cấu hình để một ứng dụng chạy trong VS Code Dev Container có thể gửi traffic qua ProxyPal (chạy trên Windows Host) để Ampcode có thể theo dõi và hỗ trợ lập trình.

## 🎯 Vấn đề kỹ thuật
1. **Mạng khác biệt**: Container coi máy Windows là một remote host (`host.docker.internal`).
2. **Giao thức**: ProxyPal thường không hỗ trợ `HTTPS CONNECT`, gây lỗi khi cài đặt thư viện (`npm/pnpm install`).
3. **Vòng lặp Proxy**: Nếu không cấu hình `NO_PROXY`, giao diện UI của Ampcode sẽ bị lỗi `fetch failed`.

---

## ✅ Bước 1: Cấu hình `devcontainer.json`

Đây là cấu hình tối ưu để tránh xung đột mạng và cho phép container "nhìn thấy" máy host.

```json
{
  "name": "My Project",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:20",
  
  "containerEnv": {
    "HTTP_PROXY": "http://host.docker.internal:8317",
    "HTTPS_PROXY": "http://host.docker.internal:8317",
    "NO_PROXY": "localhost,127.0.0.1,host.docker.internal,192.168.65.254,172.28.16.1",
    "NODE_TLS_REJECT_UNAUTHORIZED": "0"
  },

  "runArgs": [
    "--add-host=host.docker.internal:host-gateway",
    "--dns=8.8.8.8",
    "--dns=1.1.1.1"
  ],

  "postCreateCommand": "bash .devcontainer/setup-proxy.sh"
}
```

---

## ✅ Bước 2: Script `setup-proxy.sh`

Script này giải quyết vấn đề cài đặt gói: Tắt proxy khi cài đặt và bật lại khi chạy ứng dụng.

```bash
#!/bin/bash
set -e

# 1. Xóa sạch biến môi trường proxy để cài đặt không bị lỗi CONNECT/404
unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy

echo "📦 Clearing proxy for installation..."
npm config delete proxy
npm config delete https-proxy
pnpm config delete proxy || true
pnpm config delete https-proxy || true

# 2. Sử dụng HTTP registry để ổn định hơn qua Proxy
npm config set registry "http://registry.npmjs.org/"
pnpm config set registry "http://registry.npmjs.org/"
pnpm config set strict-ssl false

# 3. Cài đặt dependencies (Sử dụng mạng trực tiếp của Docker Host)
echo "📦 Installing project dependencies..."
pnpm install

# 4. Cấu hình lại proxy cho Runtime (Để Amp theo dõi traffic từ code)
echo "🔧 Configuring proxy for development runtime..."
npm config set proxy "http://host.docker.internal:8317"
pnpm config set proxy "http://host.docker.internal:8317"

# Cấu hình cho curl & git
git config --global http.proxy "http://host.docker.internal:8317"
cat > ~/.curlrc <<EOF
proxy = "http://host.docker.internal:8317"
insecure
EOF

echo "🎉 Setup complete! Amp URL: http://host.docker.internal:8317"
```

---

## ✅ Bước 3: Cấu hình ProxyPal trên Windows

Để ProxyPal không bị treo hoặc từ chối kết nối từ Container:

1. **Listen Address**: Đổi từ `127.0.0.1` thành `0.0.0.0` (Cho phép kết nối từ mạng ảo của Docker).
2. **Firewall**: Đảm bảo Windows Firewall cho phép port `8317`.
3. **Thứ tự khởi động**:
   - Tắt ProxyPal.
   - Rebuild Dev Container.
   - Khi Container đã lên, mới bật lại ProxyPal.

---

## ✅ Bước 4: Điền thông tin vào Amp UI trong VS Code

Khi điền vào giao diện Ampcode bên trong Dev Container:

- **Amp URL**: `http://host.docker.internal:8317`
- **Access Token**: `proxypal-local`

> **Mẹo**: Nếu vẫn lỗi `fetch failed`, hãy dùng IP trực tiếp mà Docker cấp cho Host (thường là `192.168.65.254` hoặc `172.x.x.x`).

---

## 🔍 Cách kiểm tra nhanh (Cheat Sheet)

Mở terminal trong container và chạy:

```bash
# Kiểm tra DNS
curl -I http://host.docker.internal:8317

# Kiểm tra HTTPS qua Proxy (phải trả về 200 OK)
curl -I --insecure https://www.google.com

# Kiểm tra npm
npm ping
```

---

## ⚠️ Lưu ý bảo mật
- Luôn nhớ tắt `NODE_TLS_REJECT_UNAUTHORIZED=0` khi đóng gói ứng dụng production.
- Script này chỉ nên dùng trong môi trường Development.
