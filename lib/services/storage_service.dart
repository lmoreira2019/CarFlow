import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static const String _fuelKey = 'carflow_fuel_logs';
  static const String _maintKey = 'carflow_maintenance_records';
  static const String _vehicleKey = 'carflow_vehicle_info';

  static Future<void> saveFuelLogs(List<Map<String, dynamic>> logs) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_fuelKey, jsonEncode(logs));
  }

  static Future<List<Map<String, dynamic>>> getFuelLogs() async {
    final prefs = await SharedPreferences.getInstance();
    final String? data = prefs.getString(_fuelKey);
    if (data == null) return [];
    return List<Map<String, dynamic>>.from(jsonDecode(data));
  }

  static Future<void> saveVehicleInfo(Map<String, dynamic> info) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_vehicleKey, jsonEncode(info));
  }

  static Future<Map<String, dynamic>?> getVehicleInfo() async {
    final prefs = await SharedPreferences.getInstance();
    final String? data = prefs.getString(_vehicleKey);
    if (data == null) return null;
    return Map<String, dynamic>.from(jsonDecode(data));
  }
  
  static Future<void> saveMaintenanceRecords(List<Map<String, dynamic>> records) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_maintKey, jsonEncode(records));
  }

  static Future<List<Map<String, dynamic>>> getMaintenanceRecords() async {
    final prefs = await SharedPreferences.getInstance();
    final String? data = prefs.getString(_maintKey);
    if (data == null) return [];
    return List<Map<String, dynamic>>.from(jsonDecode(data));
  }
}
