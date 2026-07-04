import 'package:flutter/material.dart';
import '../models/document.dart';
import '../theme.dart';
import '../widgets/document_card.dart';

class DocumentsScreen extends StatefulWidget {
  const DocumentsScreen({super.key, required this.onOpen});
  final ValueChanged<OcrDocument> onOpen;
  @override
  State<DocumentsScreen> createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends State<DocumentsScreen> {
  String query = '';
  int filter = 0;
  @override
  Widget build(BuildContext context) {
    final list = sampleDocuments.where((d) {
      final matchesQuery = '${d.fileName} ${d.vendor} ${d.number} ${d.taxCode}'.toLowerCase().contains(query.toLowerCase());
      final matchesFilter = filter == 0 || (filter == 1 && d.status == DocumentStatus.waitingReview) || (filter == 2 && d.status == DocumentStatus.approved);
      return matchesQuery && matchesFilter;
    }).toList();
    return SafeArea(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      const Padding(padding: EdgeInsets.fromLTRB(20, 20, 20, 6), child: Text('Chứng từ', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: ink))),
      const Padding(padding: EdgeInsets.symmetric(horizontal: 20), child: Text('Tìm kiếm và kiểm tra dữ liệu OCR.', style: TextStyle(color: muted, fontSize: 12))),
      Padding(padding: const EdgeInsets.fromLTRB(20, 18, 20, 10), child: TextField(onChanged: (value) => setState(() => query = value), decoration: const InputDecoration(hintText: 'Số hóa đơn, MST, nhà cung cấp...', prefixIcon: Icon(Icons.search)))),
      SizedBox(height: 42, child: ListView(scrollDirection: Axis.horizontal, padding: const EdgeInsets.symmetric(horizontal: 20), children: [
        _Chip(label: 'Tất cả', selected: filter == 0, onTap: () => setState(() => filter = 0)),
        _Chip(label: 'Chờ kiểm tra', selected: filter == 1, onTap: () => setState(() => filter = 1)),
        _Chip(label: 'Đã duyệt', selected: filter == 2, onTap: () => setState(() => filter = 2)),
      ])),
      Expanded(child: ListView.builder(padding: const EdgeInsets.fromLTRB(20, 12, 20, 100), itemCount: list.length, itemBuilder: (_, i) => DocumentCard(document: list[i], onTap: () => widget.onOpen(list[i])))),
    ]));
  }
}

class _Chip extends StatelessWidget {
  const _Chip({required this.label, required this.selected, required this.onTap});
  final String label;
  final bool selected;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) => Padding(padding: const EdgeInsets.only(right: 8), child: ChoiceChip(label: Text(label), selected: selected, onSelected: (_) => onTap(), selectedColor: softGreen, labelStyle: TextStyle(fontSize: 11, color: selected ? brandGreen : muted, fontWeight: FontWeight.w600), side: const BorderSide(color: Color(0xFFE1E7E5))));
}
