import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../theme.dart';

Future<void> showScanSheet(BuildContext context) async {
  await showModalBottomSheet<void>(
    context: context,
    showDragHandle: true,
    isScrollControlled: true,
    backgroundColor: Colors.white,
    builder: (sheetContext) => SafeArea(child: Padding(
      padding: const EdgeInsets.fromLTRB(20, 4, 20, 22),
      child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Thêm chứng từ', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: ink)),
        const SizedBox(height: 5),
        const Text('Chọn nguồn để bắt đầu đọc dữ liệu OCR.', style: TextStyle(color: muted, fontSize: 12)),
        const SizedBox(height: 20),
        _SourceTile(icon: Icons.camera_alt_outlined, title: 'Chụp ảnh', subtitle: 'Căn thẳng chứng từ và đảm bảo đủ sáng', onTap: () async {
          final file = await ImagePicker().pickImage(source: ImageSource.camera, imageQuality: 90);
          if (file != null && sheetContext.mounted) _processing(sheetContext);
        }),
        _SourceTile(icon: Icons.photo_library_outlined, title: 'Chọn từ thư viện', subtitle: 'JPG, JPEG hoặc PNG tối đa 10 MB', onTap: () async {
          final file = await ImagePicker().pickImage(source: ImageSource.gallery);
          if (file != null && sheetContext.mounted) _processing(sheetContext);
        }),
        _SourceTile(icon: Icons.picture_as_pdf_outlined, title: 'Tải file PDF', subtitle: 'PDF tối đa 20 MB và 10 trang', onTap: () async {
          final result = await FilePicker.platform.pickFiles(type: FileType.custom, allowedExtensions: ['pdf']);
          if (result != null && sheetContext.mounted) _processing(sheetContext);
        }),
      ]),
    )),
  );
}

void _processing(BuildContext context) {
  Navigator.pop(context);
  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Đã nhận file. Hệ thống đang xử lý OCR...'), duration: Duration(seconds: 3)));
}

class _SourceTile extends StatelessWidget {
  const _SourceTile({required this.icon, required this.title, required this.subtitle, required this.onTap});
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) => Card(margin: const EdgeInsets.only(bottom: 10), child: ListTile(
    onTap: onTap,
    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
    leading: Container(width: 43, height: 43, decoration: BoxDecoration(color: softGreen, borderRadius: BorderRadius.circular(11)), child: Icon(icon, color: brandGreen)),
    title: Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
    subtitle: Padding(padding: const EdgeInsets.only(top: 4), child: Text(subtitle, style: const TextStyle(fontSize: 10, color: muted))),
    trailing: const Icon(Icons.chevron_right, color: muted),
  ));
}
