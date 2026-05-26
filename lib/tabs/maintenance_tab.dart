import 'package:flutter/material.dart';
import '../services/storage_service.dart';
import 'package:intl/intl.dart';

class MaintenanceTab extends StatefulWidget {
  const MaintenanceTab({super.key});

  @override
  State<MaintenanceTab> createState() => _MaintenanceTabState();
}

class _MaintenanceTabState extends State<MaintenanceTab> {
  final _formKey = GlobalKey<FormState>();
  final _odometerController = TextEditingController();
  final _descriptionController = TextEditingController();
  String _selectedItem = 'Óleo do Motor';
  
  final List<String> _items = [
    'Óleo do Motor',
    'Filtro de Ar',
    'Filtro de Combustível',
    'Pastilhas de Freio',
    'Suspensão',
    'Pneus',
    'Bateria',
  ];

  List<Map<String, dynamic>> _records = [];

  @override
  void initState() {
    super.initState();
    _loadRecords();
  }

  Future<void> _loadRecords() async {
    final records = await StorageService.getMaintenanceRecords();
    setState(() => _records = records);
  }

  void _saveRecord() async {
    if (_formKey.currentState!.validate()) {
      final newRecord = {
        'id': DateTime.now().millisecondsSinceEpoch,
        'timestamp': DateTime.now().toIso8601String(),
        'item': _selectedItem,
        'odometer': int.parse(_odometerController.text),
        'description': _descriptionController.text,
      };

      _records.insert(0, newRecord);
      await StorageService.saveMaintenanceRecords(_records);
      
      _odometerController.clear();
      _descriptionController.clear();
      
      setState(() {});
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('✅ Manutenção registrada!')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('🔧 Manutenção')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      DropdownButtonFormField<String>(
                        value: _selectedItem,
                        decoration: const InputDecoration(labelText: 'Item de Manutenção'),
                        items: _items.map((i) => DropdownMenuItem(value: i, child: Text(i))).toList(),
                        onChanged: (v) => setState(() => _selectedItem = v!),
                      ),
                      TextFormField(
                        controller: _odometerController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'Odômetro Atual (KM)'),
                        validator: (v) => v!.isEmpty ? 'Obrigatório' : null,
                      ),
                      TextFormField(
                        controller: _descriptionController,
                        decoration: const InputDecoration(labelText: 'Observações (opcional)'),
                      ),
                      const SizedBox(height: 20),
                      ElevatedButton(
                        onPressed: _saveRecord,
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF58A6FF)),
                        child: const Text('SALVAR MANUTENÇÃO', style: TextStyle(color: Colors.white)),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _records.length,
              itemBuilder: (context, index) {
                final record = _records[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    title: Text('${record['item']} - ${record['odometer']} KM'),
                    subtitle: Text(DateFormat('dd/MM/yyyy').format(DateTime.parse(record['timestamp']))),
                    trailing: const Icon(Icons.check_circle, color: Color(0xFF2EA44F)),
                  ),
                );
              },
            )
          ],
        ),
      ),
    );
  }
}
