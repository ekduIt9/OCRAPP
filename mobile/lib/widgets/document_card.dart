import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/document.dart';
import '../theme.dart';

class DocumentCard extends StatelessWidget {
  const DocumentCard({super.key, required this.document, required this.onTap});
  final OcrDocument document;
  final VoidCallback onTap;

  Color get statusColor => switch (document.status) {
    DocumentStatus.approved => brandGreen,
    DocumentStatus.waitingReview => const Color(0xFFB87532),
    DocumentStatus.needCorrection => const Color(0xFFC14F59),
    DocumentStatus.processing => const Color(0xFF4676BA),
  };

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(children: [
            Container(
              width: 44, height: 50,
              decoration: BoxDecoration(color: const Color(0xFFF8FAF9), border: Border.all(color: const Color(0xFFE1E7E5)), borderRadius: BorderRadius.circular(9)),
              child: Center(child: Text(document.fileName.endsWith('.pdf') ? 'PDF' : 'IMG', style: const TextStyle(color: Color(0xFFC34F58), fontSize: 10, fontWeight: FontWeight.w700))),
            ),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(document.fileName, style: const TextStyle(fontWeight: FontWeight.w700, color: ink)),
              const SizedBox(height: 5),
              Text(document.vendor, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12, color: muted)),
              const SizedBox(height: 8),
              Row(children: [
                Text('${NumberFormat('#,###', 'vi_VN').format(document.amount)} ₫', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                  decoration: BoxDecoration(color: statusColor.withValues(alpha: .1), borderRadius: BorderRadius.circular(20)),
                  child: Text(document.statusLabel, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: statusColor)),
                ),
              ]),
            ])),
          ]),
        ),
      ),
    );
  }
}
