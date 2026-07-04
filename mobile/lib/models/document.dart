enum DocumentStatus { approved, waitingReview, needCorrection, processing }

class OcrDocument {
  OcrDocument({
    required this.id,
    required this.fileName,
    required this.type,
    required this.number,
    required this.vendor,
    required this.taxCode,
    required this.date,
    required this.amount,
    required this.status,
    required this.confidence,
  });

  final int id;
  final String fileName;
  final String type;
  final String number;
  final String vendor;
  final String taxCode;
  final String date;
  final double amount;
  DocumentStatus status;
  final int confidence;

  String get statusLabel => switch (status) {
    DocumentStatus.approved => 'Đã duyệt',
    DocumentStatus.waitingReview => 'Chờ kiểm tra',
    DocumentStatus.needCorrection => 'Cần chỉnh sửa',
    DocumentStatus.processing => 'Đang xử lý',
  };
}

final sampleDocuments = <OcrDocument>[
  OcrDocument(id: 1, fileName: 'HD_000128.pdf', type: 'Hóa đơn VAT', number: '00000128', vendor: 'Công ty TNHH An Phát', taxCode: '0315478921', date: '04/07/2026', amount: 18755000, status: DocumentStatus.approved, confidence: 96),
  OcrDocument(id: 2, fileName: 'PGH_HN2048.jpg', type: 'Phiếu giao hàng', number: 'GH-2048', vendor: 'Công ty CP Minh Long', taxCode: '0106248379', date: '04/07/2026', amount: 8420000, status: DocumentStatus.waitingReview, confidence: 84),
  OcrDocument(id: 3, fileName: 'invoice_8732.png', type: 'Hóa đơn VAT', number: '00008732', vendor: 'Văn phòng phẩm Hồng Hà', taxCode: '0100364756', date: '03/07/2026', amount: 3256800, status: DocumentStatus.needCorrection, confidence: 68),
  OcrDocument(id: 4, fileName: 'PNK_0726.pdf', type: 'Phiếu nhập kho', number: 'NK-0726', vendor: 'Công ty TNHH Đông Nam', taxCode: '0309982764', date: '03/07/2026', amount: 45200000, status: DocumentStatus.approved, confidence: 93),
  OcrDocument(id: 5, fileName: 'HD_FPT_3291.pdf', type: 'Hóa đơn VAT', number: '00003291', vendor: 'FPT Telecom', taxCode: '0101778163', date: '02/07/2026', amount: 1298000, status: DocumentStatus.approved, confidence: 98),
];
