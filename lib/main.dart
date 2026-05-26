import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'tabs/fuel_tab.dart';
import 'tabs/maintenance_tab.dart';
import 'tabs/settings_tab.dart';

void main() {
  runApp(const CarFlowApp());
}

class CarFlowApp extends StatelessWidget {
  const CarFlowApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CarFlow',
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: const Color(0xFF58A6FF),
        scaffoldBackgroundColor: const Color(0xFF0D1117),
        cardTheme: CardTheme(
          color: const Color(0xFF161B22),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
            side: const BorderSide(color: Color(0xFF30363D)),
          ),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF161B22),
          elevation: 0,
          centerTitle: true,
        ),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF58A6FF),
          secondary: Color(0xFF2EA44F),
        ),
      ),
      home: const MainNavigation(),
    );
  }
}

class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _currentIndex = 0;

  final List<Widget> _tabs = [
    const FuelTab(),
    const MaintenanceTab(),
    const SettingsTab(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _tabs[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        backgroundColor: const Color(0xFF161B22),
        selectedItemColor: const Color(0xFF58A6FF),
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.local_gas_station), label: 'Combustível'),
          BottomNavigationBarItem(icon: Icon(Icons.build), label: 'Manutenção'),
          BottomNavigationBarItem(icon: Icon(Icons.settings), label: 'Ajustes'),
        ],
      ),
    );
  }
}
