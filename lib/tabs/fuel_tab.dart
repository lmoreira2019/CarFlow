import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../services/storage_service.dart';
import 'package:intl/intl.dart';

class FuelTab extends StatefulWidget {
  const FuelTab({super.key});

  @override
  State<FuelTab> createState() => _FuelTabState();
}

class _FuelTabState extends State<FuelTab> {
  final _formKey = GlobalKey<FormState>();
  final _odometerController = TextEditingController();
  final _litersController = TextEditingController();
  final _priceController = TextEditingController();
  final _totalController = TextEditingController();
  
  List<Map<String, dynamic>> _logs = [];

  @override
  void initState() {
    super.initState();
    _loadLogs();
  }

  Future<void> _loadLogs() async {
    final logs = await StorageService.getFuelLogs();
    setState(() => _logs = logs);
  }

  Future<void> _takePhoto() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.camera);
    if (image != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Foto capturada com sucesso!')),
      );
    }
  }

  void _saveEntry() async {
    if (_formKey.currentState!.validate()) {
      final newLog = {
        'id': DateTime.now().millisecondsSinceEpoch,
        'timestamp': DateTime.now().toIso8601String(),
        'odometer': int.parse(_odometerController.text),
        'liters': double.parse(_litersController.text.replaceAll(',', '.')),
        'pricePerLiter': double.parse(_priceController.text.replaceAll(',', '.')),
        'totalSpent': double.parse(_totalController.text.replaceAll(',', '.')),
      };

      _logs.insert(0, newLog);
      await StorageService.saveFuelLogs(_logs);
      
      _odometerController.clear();
      _litersController.clear();
      _priceController.clear();
      _totalController.clear();
      
      setState(() {});
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('✅ Abastecimento salvo!')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('⛽ CarFlow - Combustível')),
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
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              controller: _odometerController,
                              keyboardType: TextInputType.number,
                              decoration: const InputDecoration(labelText: 'Odômetro (KM)'),
                              validator: (v) => v!.isEmpty ? 'Obrigatório' : null,
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.camera_alt),
                            onPressed: _takePhoto,
                          )
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              controller: _litersController,
                              keyboardType: const TextInputType.numberWithOptions(decimal: true),
                              decoration: const InputDecoration(labelText: 'Litros'),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: TextFormField(
                              controller: _priceController,
                              keyboardType: const TextInputType.numberWithOptions(decimal: true),
                              decoration: const InputDecoration(labelText: 'Preço/L'),
                            ),
                          ),
                        ],
                      ),
                      TextFormField(
                        controller: _totalController,
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        decoration: const InputDecoration(labelText: 'Total Gasto (R\$)'),
                      ),
                      const SizedBox(height: 20),
                      ElevatedButton(
                        onPressed: _saveEntry,
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2EA44F)),
                        child: const Text('REGISTRAR ABASTECIMENTO', style: TextStyle(color: Colors.white)),
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
              itemCount: _logs.length,
              itemBuilder: (context, index) {
                final log = _logs[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    title: Text('${log['odometer']} KM - R\$ ${log['totalSpent']}'),
                    subtitle: Text(DateFormat('dd/MM/yyyy HH:mm').format(DateTime.parse(log['timestamp']))),
                    trailing: const Icon(Icons.local_gas_station, color: Color(0xFF58A6FF)),
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
