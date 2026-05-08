#!/bin/bash
# Script tự động chuyển sang chế độ Test Local

echo "🔄 Đang chuyển sang chế độ TEST LOCAL..."
echo ""

# Backup file gốc
cp login.html login.html.bak
cp admin.html admin.html.bak

# Đổi login.html sang config-local.js
sed -i.tmp 's/config-public\.js/config-local.js/g' login.html
sed -i.tmp 's/config-secure\.js/config-local.js/g' login.html

# Đổi admin.html sang config-local.js
sed -i.tmp 's/config-public\.js/config-local.js/g' admin.html
sed -i.tmp 's/config-secure\.js/config-local.js/g' admin.html

# Xóa file tạm
rm -f login.html.tmp admin.html.tmp

echo "✅ Đã chuyển sang chế độ Test Local!"
echo ""
echo "📋 Thay đổi:"
echo "   - login.html: Dùng config-local.js"
echo "   - admin.html: Dùng config-local.js"
echo ""
echo "🔐 Cấu hình mật khẩu:"
echo "   - Mở file: config-local.js"
echo "   - Sửa mật khẩu trong phần 'adminAccounts'"
echo ""
echo "⚠️  LƯU Ý: KHÔNG upload config-local.js lên GitHub!"
echo ""
echo "🚀 Chạy local server:"
echo "   http-server -p 8000"
echo ""
echo "🌐 Truy cập:"
echo "   http://localhost:8000/login.html"
