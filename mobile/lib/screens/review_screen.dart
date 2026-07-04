import 'package:flutter/material.dart';
import '../models/document.dart';
import '../theme.dart';

class ReviewScreen extends StatefulWidget {
  const ReviewScreen({super.key, required this.document});
  final OcrDocument document;
  @override
  State<ReviewScreen> createState() => _ReviewScreenState();
}

class _ReviewScreenState extends State<ReviewScreen> {
  final lines = <Map<String, String>>[
    {'name':'Giấy in Double A A4','qty':'10','amount':'12.500.000'},
    {'name':'Mực in HP LaserJet','qty':'5','amount':'4.550.000'},
  ];

  Widget field(String label, String value) => Padding(
    padding: const EdgeInsets.only(bottom: 13),
    child: TextFormField(initialValue: value, decoration: InputDecoration(labelText: label)),
  );

  @override
  Widget build(BuildContext context) {
    final doc = widget.document;
    return Scaffold(
      appBar: AppBar(title: const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('Kiểm tra chứng từ', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700)), Text('Đối chiếu và chỉnh sửa dữ liệu', style: TextStyle(fontSize: 10, color: muted))]), actions: [IconButton(onPressed: () {}, icon: const Icon(Icons.more_vert))]),
      body: ListView(padding: const EdgeInsets.fromLTRB(16, 12, 16, 120), children: [
        Container(
          height: 270,
          decoration: BoxDecoration(color: const Color(0xFFE5E9E7), borderRadius: BorderRadius.circular(16)),
          padding: const EdgeInsets.all(18),
          child: Container(
            color: Colors.white,
            padding: const EdgeInsets.all(18),
            child: Column(children: [
              Text(doc.vendor.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700)),
              const SizedBox(height: 5),
              const Text('HÓA ĐƠN GIÁ TRỊ GIA TĂNG', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
              Text('Số: ${doc.number}', style: const TextStyle(fontSize: 9)),
              const Divider(height: 22),
              Align(alignment: Alignment.centerLeft, child: Text('Mã số thuế: ${doc.taxCode}\nNgày: ${doc.date}', style: const TextStyle(fontSize: 9, height: 1.6))),
              const Divider(),
              ...lines.map((line) => Padding(padding: const EdgeInsets.symmetric(vertical: 5), child: Row(children: [Expanded(child: Text(line['name']!, style: const TextStyle(fontSize: 9))), Text('${line['qty']}  ×  ${line['amount']}', style: const TextStyle(fontSize: 9))]))),
              const Spacer(),
              const Align(alignment: Alignment.centerRight, child: Text('Tổng thanh toán: 18.755.000 ₫', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700))),
            ]),
          ),
        ),
        const SizedBox(height: 14),
        Card(child: Padding(padding: const EdgeInsets.all(14), child: Row(children: [const Icon(Icons.auto_awesome, color: brandGreen, size: 18), const SizedBox(width: 9), const Expanded(child: Text('Độ tin cậy OCR tổng thể', style: TextStyle(fontSize: 12, color: brandGreen))), Text('${doc.confidence}%', style: const TextStyle(fontWeight: FontWeight.w700, color: brandGreen))]))),
        const Padding(padding: EdgeInsets.only(top: 22, bottom: 12), child: Text('Thông tin chứng từ', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700))),
        field('Loại chứng từ', doc.type),
        Row(children: [Expanded(child: field('Số hóa đơn', doc.number)), const SizedBox(width: 10), Expanded(child: field('Ngày hóa đơn', doc.date))]),
        field('Tên người bán', doc.vendor),
        field('Mã số thuế', doc.taxCode),
        Row(children: [Expanded(child: field('Tiền trước thuế', '17.050.000')), const SizedBox(width: 10), Expanded(child: field('Tiền thuế VAT', '1.705.000'))]),
        field('Tổng thanh toán', '18.755.000'),
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [const Text('Hàng hóa, dịch vụ', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)), TextButton.icon(onPressed: () => setState(() => lines.add({'name':'','qty':'1','amount':'0'})), icon: const Icon(Icons.add, size: 17), label: const Text('Thêm dòng'))]),
        ...lines.asMap().entries.map((entry) => Card(margin: const EdgeInsets.only(bottom: 9), child: Padding(padding: const EdgeInsets.all(12), child: Row(children: [
          Expanded(child: Column(children: [TextFormField(initialValue: entry.value['name'], decoration: const InputDecoration(labelText: 'Tên hàng hóa')), const SizedBox(height: 8), Row(children: [Expanded(child: TextFormField(initialValue: entry.value['qty'], decoration: const InputDecoration(labelText: 'Số lượng'))), const SizedBox(width: 8), Expanded(child: TextFormField(initialValue: entry.value['amount'], decoration: const InputDecoration(labelText: 'Thành tiền')))])])),
          IconButton(onPressed: () => setState(() => lines.removeAt(entry.key)), icon: const Icon(Icons.delete_outline, color: Color(0xFFC14F59))),
        ])))),
      ]),
      bottomNavigationBar: SafeArea(child: Container(padding: const EdgeInsets.fromLTRB(16, 12, 16, 10), decoration: const BoxDecoration(color: Colors.white, border: Border(top: BorderSide(color: Color(0xFFE3E9E7)))), child: Row(children: [
        Expanded(child: OutlinedButton(onPressed: () => Navigator.pop(context), child: const Text('Từ chối'))),
        const SizedBox(width: 10),
        Expanded(flex: 2, child: FilledButton.icon(onPressed: () {doc.status = DocumentStatus.approved; Navigator.pop(context); ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Đã duyệt và lưu chứng từ.')));}, icon: const Icon(Icons.check, size: 18), label: const Text('Duyệt chứng từ'))),
      ]))),
    );
  }
}
