import 'package:flutter/material.dart';
import 'models/document.dart';
import 'screens/documents_screen.dart';
import 'screens/home_screen.dart';
import 'screens/review_screen.dart';
import 'screens/scan_sheet.dart';
import 'theme.dart';

void main() => runApp(const ScanBizApp());

class ScanBizApp extends StatelessWidget {
  const ScanBizApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ScanBiz',
      debugShowCheckedModeBanner: false,
      theme: scanBizTheme(),
      home: const AppShell(),
    );
  }
}

class AppShell extends StatefulWidget {
  const AppShell({super.key});
  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int index = 0;

  void openDocument(OcrDocument document) {
    Navigator.push(context, MaterialPageRoute(builder: (_) => ReviewScreen(document: document))).then((_) => setState(() {}));
  }

  @override
  Widget build(BuildContext context) {
    final screens = [
      HomeScreen(onOpenDocument: openDocument, onScan: () => showScanSheet(context), onShowAll: () => setState(() => index = 1)),
      DocumentsScreen(onOpen: openDocument),
      const _Placeholder(title: 'Báo cáo', icon: Icons.bar_chart_rounded, subtitle: 'Thống kê sản lượng và độ chính xác OCR.'),
      const _Placeholder(title: 'Tài khoản', icon: Icons.person_outline, subtitle: 'Quản lý hồ sơ, công ty và gói dịch vụ.'),
    ];
    return Scaffold(
      body: IndexedStack(index: index, children: screens),
      floatingActionButton: FloatingActionButton(
        onPressed: () => showScanSheet(context),
        backgroundColor: brandGreen,
        foregroundColor: Colors.white,
        shape: const CircleBorder(),
        child: const Icon(Icons.document_scanner_outlined),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: NavigationBar(
        selectedIndex: index,
        onDestinationSelected: (value) => setState(() => index = value),
        height: 68,
        backgroundColor: Colors.white,
        indicatorColor: softGreen,
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home_rounded, color: brandGreen), label: 'Trang chủ'),
          NavigationDestination(icon: Icon(Icons.description_outlined), selectedIcon: Icon(Icons.description_rounded, color: brandGreen), label: 'Chứng từ'),
          NavigationDestination(icon: Icon(Icons.bar_chart_outlined), selectedIcon: Icon(Icons.bar_chart_rounded, color: brandGreen), label: 'Báo cáo'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person, color: brandGreen), label: 'Tài khoản'),
        ],
      ),
    );
  }
}

class _Placeholder extends StatelessWidget {
  const _Placeholder({required this.title, required this.icon, required this.subtitle});
  final String title;
  final IconData icon;
  final String subtitle;
  @override
  Widget build(BuildContext context) => SafeArea(child: Center(child: Padding(padding: const EdgeInsets.all(30), child: Column(mainAxisSize: MainAxisSize.min, children: [
    Container(width: 68, height: 68, decoration: BoxDecoration(color: softGreen, borderRadius: BorderRadius.circular(20)), child: Icon(icon, size: 31, color: brandGreen)),
    const SizedBox(height: 18),
    Text(title, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700)),
    const SizedBox(height: 7),
    Text(subtitle, textAlign: TextAlign.center, style: const TextStyle(color: muted)),
  ]))));
}
