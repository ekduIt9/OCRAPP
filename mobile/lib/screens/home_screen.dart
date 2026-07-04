import 'package:flutter/material.dart';
import '../models/document.dart';
import '../theme.dart';
import '../widgets/document_card.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key, required this.onOpenDocument, required this.onScan, required this.onShowAll});
  final ValueChanged<OcrDocument> onOpenDocument;
  final VoidCallback onScan;
  final VoidCallback onShowAll;

  @override
  Widget build(BuildContext context) {
    final waiting = sampleDocuments.where((d) => d.status == DocumentStatus.waitingReview).length;
    return SafeArea(child: CustomScrollView(slivers: [
      SliverPadding(
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 14),
        sliver: SliverToBoxAdapter(child: Row(children: [
          Container(width: 44, height: 44, decoration: BoxDecoration(color: brandGreen, borderRadius: BorderRadius.circular(13)), child: const Icon(Icons.document_scanner_outlined, color: Colors.white)),
          const SizedBox(width: 11),
          const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('Chào buổi sáng, An 👋', style: TextStyle(fontSize: 19, fontWeight: FontWeight.w700, color: ink)), SizedBox(height: 3), Text('Cùng xử lý chứng từ hôm nay nhé.', style: TextStyle(fontSize: 12, color: muted))])),
          IconButton(onPressed: () {}, icon: const Badge(child: Icon(Icons.notifications_none_rounded))),
        ])),
      ),
      SliverPadding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        sliver: SliverToBoxAdapter(child: Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(color: brandGreen, borderRadius: BorderRadius.circular(20)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Số hóa chứng từ trong vài giây', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
            const Padding(padding: EdgeInsets.only(top: 6, bottom: 16), child: Text('Chụp ảnh hoặc tải file để AI tự động đọc dữ liệu.', style: TextStyle(color: Color(0xFFCBE4DC), fontSize: 12))),
            FilledButton.icon(onPressed: onScan, style: FilledButton.styleFrom(backgroundColor: Colors.white, foregroundColor: brandGreen), icon: const Icon(Icons.camera_alt_outlined, size: 19), label: const Text('Quét chứng từ')),
          ]),
        )),
      ),
      SliverPadding(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
        sliver: SliverToBoxAdapter(child: Row(children: [
          Expanded(child: _Metric(label: 'Tổng chứng từ', value: '${sampleDocuments.length}', icon: Icons.description_outlined, color: brandGreen)),
          const SizedBox(width: 10),
          Expanded(child: _Metric(label: 'Chờ kiểm tra', value: '$waiting', icon: Icons.schedule_rounded, color: const Color(0xFFD9823F))),
        ])),
      ),
      SliverPadding(
        padding: const EdgeInsets.fromLTRB(20, 22, 20, 10),
        sliver: SliverToBoxAdapter(child: Row(children: [const Expanded(child: Text('Gần đây', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700))), TextButton(onPressed: onShowAll, child: const Text('Xem tất cả'))])),
      ),
      SliverPadding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        sliver: SliverList.builder(itemCount: 3, itemBuilder: (_, i) => DocumentCard(document: sampleDocuments[i], onTap: () => onOpenDocument(sampleDocuments[i]))),
      ),
      const SliverToBoxAdapter(child: SizedBox(height: 100)),
    ]));
  }
}

class _Metric extends StatelessWidget {
  const _Metric({required this.label, required this.value, required this.icon, required this.color});
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  @override
  Widget build(BuildContext context) => Card(child: Padding(padding: const EdgeInsets.all(14), child: Row(children: [
    Container(width: 38, height: 38, decoration: BoxDecoration(color: color.withValues(alpha: .1), borderRadius: BorderRadius.circular(10)), child: Icon(icon, size: 19, color: color)),
    const SizedBox(width: 10),
    Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(value, style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w700)), Text(label, style: const TextStyle(fontSize: 10, color: muted))]),
  ])));
}
