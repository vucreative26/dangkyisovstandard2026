#!/bin/bash
# Script tự động chuyển sang chế độ Hosting PHP

echo "🔄 Đang chuyển sang chế độ HOSTING PHP..."
echo ""

# Backup file gốc
cp login.html login.html.bak
cp admin.html admin.html.bak

# Đổi login.html sang config-secure.js
sed -i.tmp 's/config-public\.js/config-secure.js/g' login.html
sed -i.tmp 's/config-local\.js/config-secure.js/g' login.html

# Đổi admin.html sang config-secure.js
sed -i.tmp 's/config-public\.js/config-secure.js/g' admin.html
sed -i.tmp 's/config-local\.js/config-secure.js/g' admin.html

# Xóa file tạm
rm -f login.html.tmp admin.html.tmp

echo "✅ Đã chuyển sang chế độ Hosting PHP!"
echo ""
echo "📋 Thay đổi:"
echo "   - login.html: Dùng config-secure.js"
echo "   - admin.html: Dùng config-secure.js"
echo ""
echo "🔐 Cấu hình mật khẩu:"
echo "   - Mở file: auth-api.php"
echo "   - Sửa mật khẩu trong phần 'adminAccounts'"
echo ""
echo "✅ Bảo mật: Mật khẩu nằm ở server, an toàn!"
echo ""
echo "📤 File cần upload lên hosting:"
echo "   ✅ Tất cả file HTML, CSS, JS"
echo "   ✅ auth-api.php (QUAN TRỌNG)"
echo "   ✅ .htaccess (QUAN TRỌNG)"
echo "   ✅ Folder assets/"
echo "   ❌ KHÔNG upload: config-local.js, config-public.js"
