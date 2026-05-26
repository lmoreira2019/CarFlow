import 'package:flutter/material.dart';
import '../services/storage_service.dart';

class SettingsTab extends StatefulWidget {
  const SettingsTab({super.key});

  @override
  State<SettingsTab> createState() => _SettingsTabState();
}

class _SettingsTabState extends State<SettingsTab> {
  final _brandController = TextEditingController();
  final _modelController = TextEditingController();
  final _yearController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadVehicle();
  }

  Future<void> _loadVehicle() async {
    final info = await StorageService.getVehicleInfo();
    if (info != null) {
      _brandController.text = info['brand'] ?? '';
      _modelController.text = info['model'] ?? '';
      _yearController.text = info['year']?.toString() ?? '';
    }
  }

  void _saveVehicle() async {
    final info = {
      'brand': _brandController.text,
      'model': _modelController.text,
      'year': int.tryParse(_yearController.text),
    };
    await StorageService.saveVehicleInfo(info);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('✅ Veículo atualizado!')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('⚙️ Configurações')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('INFORMAÇÕES DO VEÍCULO', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)),
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  TextField(controller: _brandController, decoration: const InputDecoration(labelText: 'Marca')),
                  TextField(controller: _modelController, decoration: const InputDecoration(labelText: 'Modelo')),
                  TextField(controller: _yearController, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Ano')),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: _saveVehicle,
                    style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 45)),
                    child: const Text('SALVAR VEÍCULO'),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          const Text('DADOS DO APLICATIVO', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)),
          const SizedBox(height: 12),
          ListTile(
            tileColor: const Color(0xFF161B22),
            leading: const Icon(Icons.file_download, color: Color(0xFF58A6FF)),
            title: const Text('Exportar Dados (JSON)'),
            onTap: () {}, // Implementação futura de exportação
          ),
          const SizedBox(height: 8),
          ListTile(
            tileColor: const Color(0xFF161B22),
            leading: const Icon(Icons.delete_forever, color: Colors.red),
            title: const Text('Limpar Todos os Dados', style: TextStyle(color: Colors.red)),
            onTap: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Limpar dados?'),
                  content: const Text('Esta ação não pode ser desfeita.'),
                  actions: [
                    TextButton(onPressed: () => Navigator.pop(context), child: const Text('CANCELAR')),
                    TextButton(onPressed: () => Navigator.pop(context), child: const Text('LIMPAR', style: TextStyle(color: Colors.red))),
                  ],
                ),
              );
            },
          ),
          const SizedBox(height: 40),
          const Center(child: Text('CarFlow v1.0.0 (Native)', style: TextStyle(color: Colors.grey, fontSize: 12))),
        ],
      ),
    );
  }
}
