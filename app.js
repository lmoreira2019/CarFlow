// ============================================================================
// CarFlow v2.0 - Main Application Logic
// Intelligent Fuel & Maintenance Tracker
// ============================================================================

const STORAGE_KEYS = {
    FUEL_LOGS: 'carflow_fuel_logs',
    MAINTENANCE_RECORDS: 'carflow_maintenance_records',
    VEHICLE_INFO: 'carflow_vehicle_info'
};

const MAINTENANCE_ITEMS = {
    oil_filter: { name: 'Óleo do Motor & Filtro', id: 'oil_filter' },
    air_filter: { name: 'Filtro de Ar do Motor', id: 'air_filter' },
    fuel_filter: { name: 'Filtro de Combustível', id: 'fuel_filter' },
    cabin_filter: { name: 'Filtro de Ar Condicionado', id: 'cabin_filter' },
    battery: { name: 'Bateria', id: 'battery' },
    brake_pads: { name: 'Pastilha de Freio', id: 'brake_pads' },
    coolant: { name: 'Líquido de Arrefecimento', id: 'coolant' },
    timing_belt: { name: 'Correia Dentada', id: 'timing_belt' },
    timing_chain: { name: 'Corrente de Comando', id: 'timing_chain' },
    suspension: { name: 'Suspensão', id: 'suspension' },
    spark_plugs: { name: 'Velas', id: 'spark_plugs' }
};

// Efficiency classification
const EFFICIENCY_LEVELS = {
    bad: { min: 0, max: 9.0, label: 'RUIM', color: 'danger', icon: '🔴' },
    reasonable: { min: 9.1, max: 11.0, label: 'RAZOÁVEL', color: 'warning', icon: '🟡' },
    good: { min: 11.1, max: 13.0, label: 'BOM', color: 'success', icon: '🟢' },
    excellent: { min: 13.1, max: Infinity, label: 'EXCELENTE', color: 'excellent', icon: '⭐' }
};

// ============================================================================
// Vehicle Information Management
// ============================================================================

function saveVehicleInfo(brand, model, year) {
    const vehicleInfo = {
        brand: brand || '',
        model: model || '',
        year: year || null,
        savedAt: new Date().toISOString()
    };

    saveData(STORAGE_KEYS.VEHICLE_INFO, vehicleInfo);
    return vehicleInfo;
}

function getVehicleInfo() {
    return getStoredData(STORAGE_KEYS.VEHICLE_INFO, {
        brand: '',
        model: '',
        year: null
    });
}

function displayVehicleInfo() {
    const vehicleInfo = getVehicleInfo();
    const displayContainer = document.getElementById('vehicleDisplay');
    const vehicleInfoSpan = document.getElementById('vehicleInfo');

    if (vehicleInfo.brand || vehicleInfo.model || vehicleInfo.year) {
        const infoText = `${vehicleInfo.brand || '?'} ${vehicleInfo.model || '?'} ${vehicleInfo.year || '?'}`;
        vehicleInfoSpan.textContent = infoText;
        displayContainer.style.display = 'block';

        // Update form fields
        document.getElementById('vehicleBrand').value = vehicleInfo.brand || '';
        document.getElementById('vehicleModel').value = vehicleInfo.model || '';
        document.getElementById('vehicleYear').value = vehicleInfo.year || '';
    } else {
        displayContainer.style.display = 'none';
    }
}

// ============================================================================
// Data Management
// ============================================================================

function checkLocalStorage() {
    try {
        const test = '__carflow_test__';
        localStorage.setItem(test, test);
        const result = localStorage.getItem(test) === test;
        localStorage.removeItem(test);
        return result;
    } catch {
        return false;
    }
}

function getStoredData(key, defaultValue = []) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch {
        return defaultValue;
    }
}

function showSaveStatus() {
    const indicator = document.getElementById('saveIndicator');
    const text = document.getElementById('saveText');

    if (indicator) {
        indicator.style.backgroundColor = '#2ea44f';
        text.textContent = 'Salvando...';

        setTimeout(() => {
            indicator.style.backgroundColor = '#2ea44f';
            text.textContent = 'Dados salvos ✓';
        }, 300);
    }
}

function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        showSaveStatus();
    } catch (error) {
        console.error('Erro ao salvar no localStorage:', error);
        const text = document.getElementById('saveText');
        if (text) {
            text.textContent = 'Erro ao salvar!';
            text.style.color = 'var(--danger-red)';
        }
    }
}

// ============================================================================
// Intelligent Fuel Calculation
// ============================================================================

function normalizeNumber(value) {
    if (!value && value !== 0) return 0;
    // Converte vírgula para ponto
    return parseFloat(String(value).replace(',', '.')) || 0;
}

function formatDecimal(value, decimals = 2) {
    if (!value && value !== 0) return '';
    return parseFloat(value).toFixed(decimals);
}

function getEfficiencyClassification(efficiency) {
    if (!efficiency) return null;

    const eff = parseFloat(efficiency);

    for (const [key, level] of Object.entries(EFFICIENCY_LEVELS)) {
        if (eff >= level.min && eff <= level.max) {
            return { key, ...level, value: eff };
        }
    }

    return null;
}

function calculateSmartFuel(liters, pricePerLiter, totalSpent) {
    const filledFields = [
        liters !== null && liters !== '',
        pricePerLiter !== null && pricePerLiter !== '',
        totalSpent !== null && totalSpent !== ''
    ].filter(Boolean).length;

    if (filledFields < 2) return { liters, pricePerLiter, totalSpent, calculated: null };

    let result = { liters, pricePerLiter, totalSpent, calculated: null };

    if (filledFields === 3) {
        return result; // All filled, no calculation needed
    }

    const l = normalizeNumber(liters);
    const p = normalizeNumber(pricePerLiter);
    const t = normalizeNumber(totalSpent);

    // Missing liters
    if (!liters && pricePerLiter && totalSpent) {
        result.liters = formatDecimal(t / p, 2);
        result.calculated = 'liters';
    }
    // Missing pricePerLiter
    else if (liters && !pricePerLiter && totalSpent) {
        result.pricePerLiter = formatDecimal(t / l, 2);
        result.calculated = 'pricePerLiter';
    }
    // Missing totalSpent
    else if (liters && pricePerLiter && !totalSpent) {
        result.totalSpent = formatDecimal(l * p, 2);
        result.calculated = 'totalSpent';
    }

    return result;
}

function addFuelLog(odometer, liters, pricePerLiter, totalSpent, dateTime = null, gasStation = null) {
    const logs = getStoredData(STORAGE_KEYS.FUEL_LOGS, []);

    let previousLiters = null;
    let efficiency = null;

    const normalizedLiters = normalizeNumber(liters);
    const normalizedPrice = normalizeNumber(pricePerLiter);
    const normalizedTotal = normalizeNumber(totalSpent);

    if (logs.length > 0) {
        const previousLog = logs[logs.length - 1];
        previousLiters = previousLog.liters;
        const distanceTraveled = parseInt(odometer) - previousLog.odometer;

        if (distanceTraveled > 0 && previousLiters > 0) {
            efficiency = (distanceTraveled / previousLiters).toFixed(2);
        }
    }

    const newLog = {
        id: Date.now(),
        timestamp: dateTime ? new Date(dateTime).toISOString() : new Date().toISOString(),
        odometer: parseInt(odometer),
        liters: parseFloat(formatDecimal(normalizedLiters, 2)),
        pricePerLiter: parseFloat(formatDecimal(normalizedPrice, 2)),
        totalSpent: parseFloat(formatDecimal(normalizedTotal, 2)),
        gasStation: gasStation || null,
        efficiency: efficiency ? formatDecimal(efficiency, 2) : null,
        efficiencyClassification: efficiency ? getEfficiencyClassification(efficiency) : null
    };

    logs.push(newLog);
    saveData(STORAGE_KEYS.FUEL_LOGS, logs);

    return newLog;
}

function getFuelLogs() {
    return getStoredData(STORAGE_KEYS.FUEL_LOGS, []);
}

function deleteFuelLog(id) {
    if (!confirm('Tem certeza que deseja deletar este registro de abastecimento?')) return;

    let logs = getFuelLogs();
    logs = logs.filter(log => log.id !== id);
    saveData(STORAGE_KEYS.FUEL_LOGS, logs);
    updateUI();
}

function editFuelLog(id) {
    const logs = getFuelLogs();
    const log = logs.find(l => l.id === id);

    if (!log) return;

    // Populate modal with formatted decimals
    document.getElementById('editFuelOdometer').value = log.odometer;
    document.getElementById('editFuelLiters').value = formatDecimal(log.liters, 2);
    document.getElementById('editPricePerLiter').value = formatDecimal(log.pricePerLiter, 2);
    document.getElementById('editTotalSpent').value = formatDecimal(log.totalSpent, 2);

    // Store ID for save
    document.getElementById('editFuelModal').dataset.editId = id;
    document.getElementById('editFuelModal').classList.add('active');
}

function calculateAverageEfficiency() {
    const logs = getFuelLogs().filter(log => log.efficiency);
    if (logs.length === 0) return null;

    const sum = logs.reduce((acc, log) => acc + parseFloat(log.efficiency), 0);
    return (sum / logs.length).toFixed(2);
}

function getCurrentEfficiency() {
    const logs = getFuelLogs();
    if (logs.length === 0) return null;

    const lastLog = logs[logs.length - 1];
    return lastLog.efficiency;
}

// ============================================================================
// Maintenance Management
// ============================================================================

function addMaintenanceRecord(itemId, date, odometer, intervalKM, intervalMonths) {
    const records = getStoredData(STORAGE_KEYS.MAINTENANCE_RECORDS, []);

    const newRecord = {
        id: Date.now(),
        itemId: itemId,
        itemName: MAINTENANCE_ITEMS[itemId].name,
        date: date,
        odometer: parseInt(odometer),
        intervalKM: intervalKM ? parseInt(intervalKM) : null,
        intervalMonths: intervalMonths ? parseInt(intervalMonths) : null,
        createdAt: new Date().toISOString()
    };

    records.push(newRecord);
    saveData(STORAGE_KEYS.MAINTENANCE_RECORDS, records);

    return newRecord;
}

function getMaintenanceRecords() {
    return getStoredData(STORAGE_KEYS.MAINTENANCE_RECORDS, []).sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );
}

function deleteMaintenanceRecord(id) {
    if (!confirm('Tem certeza que deseja deletar este registro de manutenção?')) return;

    let records = getMaintenanceRecords();
    records = records.filter(r => r.id !== id);
    saveData(STORAGE_KEYS.MAINTENANCE_RECORDS, records);
    updateUI();
}

function editMaintenanceRecord(id) {
    const records = getMaintenanceRecords();
    const record = records.find(r => r.id === id);

    if (!record) return;

    // Populate modal
    document.getElementById('editMaintenanceDate').value = record.date;
    document.getElementById('editMaintenanceOdometer').value = record.odometer;
    document.getElementById('editMaintenanceIntervalKM').value = record.intervalKM || '';
    document.getElementById('editMaintenanceIntervalMonths').value = record.intervalMonths || '';

    // Store ID for save
    document.getElementById('editMaintenanceModal').dataset.editId = id;
    document.getElementById('editMaintenanceModal').classList.add('active');
}

function getNextMaintenanceForItem(itemId) {
    const records = getMaintenanceRecords();
    const itemRecords = records.filter(r => r.itemId === itemId);

    if (itemRecords.length === 0) return null;

    const lastRecord = itemRecords[0];
    const currentOdometer = getFuelLogs().length > 0
        ? getFuelLogs()[getFuelLogs().length - 1].odometer
        : null;

    let nextOdometer = null;
    let nextDate = null;

    // Calculate next odometer-based maintenance
    if (lastRecord.intervalKM) {
        nextOdometer = lastRecord.odometer + lastRecord.intervalKM;
    }

    // Calculate next time-based maintenance
    if (lastRecord.intervalMonths) {
        const nextDateObj = new Date(lastRecord.date);
        nextDateObj.setMonth(nextDateObj.getMonth() + lastRecord.intervalMonths);
        nextDate = nextDateObj;
    }

    return {
        lastRecord,
        nextOdometer,
        nextDate,
        remainingKM: nextOdometer && currentOdometer ? nextOdometer - currentOdometer : null,
        remainingDays: nextDate ? Math.ceil((nextDate - new Date()) / (1000 * 60 * 60 * 24)) : null
    };
}

// ============================================================================
// UI Update Functions
// ============================================================================

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDateShort(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function updateFuelMetrics() {
    const logs = getFuelLogs();
    const currentEfficiency = getCurrentEfficiency();
    const averageEfficiency = calculateAverageEfficiency();
    const currentClass = currentEfficiency ? getEfficiencyClassification(currentEfficiency) : null;
    const avgClass = averageEfficiency ? getEfficiencyClassification(averageEfficiency) : null;

    document.getElementById('totalEntries').textContent = logs.length;

    const currentEffEl = document.getElementById('currentEfficiency');
    if (currentEfficiency && currentClass) {
        currentEffEl.textContent = formatDecimal(currentEfficiency, 2);
        currentEffEl.className = `metric-value efficiency-badge efficiency-${currentClass.key}`;
    } else {
        currentEffEl.textContent = '—';
        currentEffEl.className = 'metric-value';
    }

    const avgEffEl = document.getElementById('averageEfficiency');
    if (averageEfficiency && avgClass) {
        avgEffEl.textContent = formatDecimal(averageEfficiency, 2);
        avgEffEl.className = `metric-value efficiency-badge efficiency-${avgClass.key}`;
    } else {
        avgEffEl.textContent = '—';
        avgEffEl.className = 'metric-value';
    }
}

function renderFuelLogs() {
    const logs = getFuelLogs().slice().reverse();
    const container = document.getElementById('fuelLogsList');

    if (logs.length === 0) {
        container.innerHTML = '<div class="empty-state">Nenhum registro de combustível ainda. Comece a rastrear seu consumo.</div>';
        return;
    }

    container.innerHTML = logs.map((log, index) => {
        // Recalculate classification if missing (for old records)
        let classification = log.efficiencyClassification;
        if (log.efficiency && !classification) {
            classification = getEfficiencyClassification(log.efficiency);
        }

        let alertMessage = '';
        if (classification && classification.key === 'bad') {
            alertMessage = `
                <div class="efficiency-alert bad-alert">
                    🔴 <strong>Consumo Ruim!</strong> ${log.efficiency} km/L é inferior a 9.0 km/L. Revise o posicionamento do pneu ou sua forma de dirigir.
                </div>
            `;
        } else if (classification && classification.key === 'reasonable') {
            alertMessage = `
                <div class="efficiency-alert reasonable-alert">
                    🟡 <strong>Consumo Razoável:</strong> ${log.efficiency} km/L. Pode melhorar!
                </div>
            `;
        }

        return `
            <div class="log-entry">
                <div class="log-header">
                    <div class="log-date">${formatDate(log.timestamp)}</div>
                </div>
                <div class="log-content">
                    <div class="log-item">
                        <span class="log-label">Odômetro</span>
                        <span class="log-value">${log.odometer.toLocaleString('pt-BR')} KM</span>
                    </div>
                    <div class="log-item">
                        <span class="log-label">Litros</span>
                        <span class="log-value">${formatDecimal(log.liters, 2)} L</span>
                    </div>
                    <div class="log-item">
                        <span class="log-label">Preço/L</span>
                        <span class="log-value">R$ ${formatDecimal(log.pricePerLiter, 2)}</span>
                    </div>
                    <div class="log-item">
                        <span class="log-label">Total Gasto</span>
                        <span class="log-value">R$ ${formatDecimal(log.totalSpent, 2)}</span>
                    </div>
                    ${log.gasStation ? `
                        <div class="log-item">
                            <span class="log-label">Posto</span>
                            <span class="log-value">${log.gasStation}</span>
                        </div>
                    ` : ''}
                    ${log.efficiency && classification ? `
                        <div class="log-item">
                            <span class="log-label">Eficiência</span>
                            <span class="log-value">
                                <span class="efficiency-badge efficiency-${classification.key}">
                                    ${classification.icon} ${formatDecimal(log.efficiency, 2)} km/L
                                </span>
                                <span class="efficiency-label efficiency-${classification.key}">${classification.label}</span>
                            </span>
                        </div>
                    ` : ''}
                </div>
                ${alertMessage}
                <div class="log-actions">
                    <button class="log-btn log-btn-edit" onclick="editFuelLog(${log.id})">✏️ Editar</button>
                    <button class="log-btn log-btn-delete" onclick="deleteFuelLog(${log.id})">🗑️ Deletar</button>
                </div>
            </div>
        `;
    }).join('');
}

function renderMaintenanceStatus() {
    const container = document.getElementById('maintenanceStatus');
    const currentOdometer = getFuelLogs().length > 0 ? getFuelLogs()[getFuelLogs().length - 1].odometer : null;

    container.innerHTML = Object.values(MAINTENANCE_ITEMS).map(item => {
        const nextMaint = getNextMaintenanceForItem(item.id);

        let statusClass = 'badge-ok';
        let statusText = 'OK';
        let statusInfo = '';

        if (!nextMaint) {
            statusClass = 'badge-soon';
            statusText = 'NUNCA TROCADO';
            statusInfo = 'Sem registros';
        } else {
            const remainingKM = nextMaint.remainingKM;
            const remainingDays = nextMaint.remainingDays;

            // Check if either threshold is met
            const overdueKM = remainingKM !== null && remainingKM < 0;
            const overdueTime = remainingDays !== null && remainingDays < 0;

            if (overdueKM || overdueTime) {
                statusClass = 'badge-overdue';
                statusText = 'VENCIDA';
            } else if ((remainingKM !== null && remainingKM < 1000) || (remainingDays !== null && remainingDays < 30)) {
                statusClass = 'badge-soon';
                statusText = 'EM BREVE';
            }

            statusInfo = `
                ${nextMaint.nextOdometer ? `<div><strong>Meta:</strong> ${nextMaint.nextOdometer.toLocaleString('pt-BR')} KM</div>` : ''}
                ${remainingKM !== null ? `<div><strong>Restam:</strong> ${Math.abs(remainingKM).toLocaleString('pt-BR')} KM</div>` : ''}
                ${nextMaint.nextDate ? `<div><strong>Data:</strong> ${formatDateShort(nextMaint.nextDate)}</div>` : ''}
                ${remainingDays !== null ? `<div><strong>Restam:</strong> ${Math.abs(remainingDays)} dias</div>` : ''}
            `;
        }

        return `
            <div class="maintenance-item">
                <div class="maintenance-name">${item.name}</div>
                <div class="maintenance-badge ${statusClass}">${statusText}</div>
                <div class="maintenance-info">
                    ${statusInfo ? `<div style="font-size: 0.85rem; color: var(--text-secondary);">${statusInfo}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function renderMaintenanceHistory() {
    const records = getMaintenanceRecords();
    const container = document.getElementById('maintenanceHistory');

    if (records.length === 0) {
        container.innerHTML = '<div class="empty-state">Nenhum registro de manutenção ainda.</div>';
        return;
    }

    container.innerHTML = records.map(record => {
        const nextMaint = getNextMaintenanceForItem(record.itemId);
        return `
            <div class="log-entry">
                <div class="log-header">
                    <div class="log-date">${formatDate(record.createdAt)}</div>
                </div>
                <div class="log-content">
                    <div class="log-item">
                        <span class="log-label">Item</span>
                        <span class="log-value">${record.itemName}</span>
                    </div>
                    <div class="log-item">
                        <span class="log-label">Data Troca</span>
                        <span class="log-value">${formatDateShort(record.date)}</span>
                    </div>
                    <div class="log-item">
                        <span class="log-label">Odômetro</span>
                        <span class="log-value">${record.odometer.toLocaleString('pt-BR')} KM</span>
                    </div>
                    ${record.intervalKM ? `
                        <div class="log-item">
                            <span class="log-label">Próxima em (KM)</span>
                            <span class="log-value">${record.intervalKM.toLocaleString('pt-BR')}</span>
                        </div>
                    ` : ''}
                    ${record.intervalMonths ? `
                        <div class="log-item">
                            <span class="log-label">Próxima em (Meses)</span>
                            <span class="log-value">${record.intervalMonths}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="log-actions">
                    <button class="log-btn log-btn-edit" onclick="editMaintenanceRecord(${record.id})">✏️ Editar</button>
                    <button class="log-btn log-btn-delete" onclick="deleteMaintenanceRecord(${record.id})">🗑️ Deletar</button>
                </div>
            </div>
        `;
    }).join('');
}

function updateUI() {
    updateFuelMetrics();
    renderFuelLogs();
    renderMaintenanceStatus();
    renderMaintenanceHistory();
}

// ============================================================================
// Smart Input Listeners
// ============================================================================

function setupSmartInputs() {
    const fuelLiters = document.getElementById('fuelLiters');
    const pricePerLiter = document.getElementById('pricePerLiter');
    const totalSpent = document.getElementById('totalSpent');
    const smartInputs = [fuelLiters, pricePerLiter, totalSpent];

    smartInputs.forEach(input => {
        // Convert comma to dot on input
        input.addEventListener('input', function() {
            this.value = this.value.replace(',', '.');
        });

        input.addEventListener('change', function() {
            const result = calculateSmartFuel(
                fuelLiters.value,
                pricePerLiter.value,
                totalSpent.value
            );

            // Update calculated fields
            if (result.calculated === 'liters') {
                fuelLiters.value = result.liters;
                fuelLiters.classList.add('calculated');
            } else {
                fuelLiters.classList.remove('calculated');
            }

            if (result.calculated === 'pricePerLiter') {
                pricePerLiter.value = result.pricePerLiter;
                pricePerLiter.classList.add('calculated');
            } else {
                pricePerLiter.classList.remove('calculated');
            }

            if (result.calculated === 'totalSpent') {
                totalSpent.value = result.totalSpent;
                totalSpent.classList.add('calculated');
            } else {
                totalSpent.classList.remove('calculated');
            }
        });
    });

    // Setup for edit modal smart inputs
    const editFuelModal = document.getElementById('editFuelModal');
    if (editFuelModal) {
        const editInputs = editFuelModal.querySelectorAll('.smart-input');
        editInputs.forEach(input => {
            input.addEventListener('input', function() {
                this.value = this.value.replace(',', '.');
            });
        });
    }
}

// ============================================================================
// Camera Functions
// ============================================================================

let currentCameraStream = null;
let cameraFieldType = 'odometer';

function openCameraModal(fieldType = 'odometer') {
    console.log('🎯 Abrindo modal de câmera...', fieldType);
    cameraFieldType = fieldType;
    const modal = document.getElementById('cameraModal');
    const title = document.getElementById('cameraTitle');

    console.log('📦 Modal encontrado?', modal);
    console.log('📝 Título encontrado?', title);

    if (!modal) {
        console.error('❌ Modal de câmera não encontrado no HTML!');
        return;
    }

    if (fieldType === 'odometer') {
        title.textContent = '📷 Fotografar Odômetro';
    } else {
        title.textContent = '📷 Fotografar Nota Fiscal';
    }

    modal.classList.add('active');
    console.log('✅ Modal aberto, classe active adicionada');
    resetCameraUI();
}

function closeCameraModal() {
    stopCamera();
    document.getElementById('cameraModal').classList.remove('active');
    resetCameraUI();
}

function resetCameraUI() {
    document.getElementById('cameraPreview').style.display = 'none';
    document.getElementById('capturedImage').style.display = 'none';
    document.getElementById('cameraControls').style.display = 'block';
    document.getElementById('captureControls').style.display = 'none';
    document.getElementById('photoControls').style.display = 'none';
}

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false
        });

        currentCameraStream = stream;
        const video = document.getElementById('cameraPreview');
        video.srcObject = stream;
        video.style.display = 'block';

        document.getElementById('cameraControls').style.display = 'none';
        document.getElementById('captureControls').style.display = 'flex';
    } catch (error) {
        alert('Erro ao acessar câmera: ' + error.message);
        console.error(error);
    }
}

function stopCamera() {
    if (currentCameraStream) {
        currentCameraStream.getTracks().forEach(track => track.stop());
        currentCameraStream = null;
    }
}

function capturePhoto() {
    const video = document.getElementById('cameraPreview');
    const canvas = document.getElementById('cameraCanvas');
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg');
    const img = document.getElementById('capturedImage');
    img.src = imageData;
    img.style.display = 'block';

    stopCamera();
    document.getElementById('cameraPreview').style.display = 'none';
    document.getElementById('captureControls').style.display = 'none';
    document.getElementById('photoControls').style.display = 'flex';
}

function retakePhoto() {
    document.getElementById('capturedImage').style.display = 'none';
    document.getElementById('photoControls').style.display = 'none';
    startCamera();
}

function usePhoto() {
    const img = document.getElementById('capturedImage');

    if (cameraFieldType === 'odometer') {
        // Store photo reference
        const photoData = img.src;
        localStorage.setItem('lastOdometerPhoto', photoData);

        // Optional: Try to extract number from image (basic approach)
        alert('📷 Foto do odômetro capturada! \n\nVocê pode digitar o valor manualmente no campo.');
    } else if (cameraFieldType === 'receipt') {
        const photoData = img.src;
        localStorage.setItem('lastReceiptPhoto', photoData);
        alert('📷 Foto da nota fiscal capturada!');
    } else {
        // Fallback for maintenance photos
        const photoData = img.src;
        const timestamp = Date.now();
        localStorage.setItem(`maintenancePhoto_${timestamp}`, photoData);
        alert('📷 Foto capturada e salva!');
    }

    closeCameraModal();
}

function openCameraChoice() {
    console.log('📸 Abrindo modal de escolha de câmera...');
    const modal = document.getElementById('cameraCategoryModal');
    if (modal) {
        modal.classList.add('active');
    } else {
        console.error('❌ Modal de escolha de câmera não encontrado!');
    }
}

function closeCameraCategoryModal() {
    console.log('❌ Fechando modal de escolha de câmera...');
    const modal = document.getElementById('cameraCategoryModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function chooseCameraType(type) {
    console.log('📷 Tipo de câmera selecionado:', type);

    // Map the choice to the internal field type
    const fieldType = type === 'odometer' ? 'odometer' : 'receipt';

    closeCameraCategoryModal();
    setTimeout(() => {
        openCameraModal(fieldType);
    }, 200);
}

// ============================================================================
// PDF Export
// ============================================================================

function generateFuelPDF() {
    const logs = getFuelLogs();

    if (logs.length === 0) {
        alert('Nenhum abastecimento para exportar!');
        return;
    }

    try {
        // Try to access jsPDF from window
        const jsPDFLib = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
        if (!jsPDFLib) {
            alert('Erro: Biblioteca jsPDF não carregada. Tente novamente.');
            console.error('jsPDF not available:', window.jspdf, window.jsPDF);
            return;
        }

        const doc = new jsPDFLib({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    let yPosition = 20;

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('🚗 CarFlow - Histórico de Abastecimentos', 105, yPosition, { align: 'center' });

    // Date
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 105, yPosition, { align: 'center' });

    // Table
    yPosition += 15;
    const headers = ['Data', 'Odômetro', 'Litros', 'Preço/L', 'Total', 'Posto', 'Eficiência'];
    const data = logs.map(log => [
        new Date(log.timestamp).toLocaleDateString('pt-BR'),
        `${log.odometer} KM`,
        `${formatDecimal(log.liters, 2)} L`,
        `R$ ${formatDecimal(log.pricePerLiter, 2)}`,
        `R$ ${formatDecimal(log.totalSpent, 2)}`,
        log.gasStation || '—',
        log.efficiency ? `${log.efficiency} km/L` : '—'
    ]);

        doc.autoTable({
            startY: yPosition,
            head: [headers],
            body: data,
            theme: 'grid',
            headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: 'bold' },
            bodyStyles: { textColor: [0, 0, 0] },
            margin: { top: 20 }
        });

        // Summary
        yPosition = doc.lastAutoTable.finalY + 15;
        doc.setFont('helvetica', 'bold');
        doc.text('Resumo:', 15, yPosition);

        yPosition += 7;
        doc.setFont('helvetica', 'normal');
        const avgEfficiency = calculateAverageEfficiency();
        doc.text(`Total de abastecimentos: ${logs.length}`, 15, yPosition);
        yPosition += 7;
        doc.text(`Eficiência média: ${avgEfficiency ? formatDecimal(avgEfficiency, 2) + ' km/L' : '—'}`, 15, yPosition);

        doc.save(`carflow-abastecimentos-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
        console.error('Erro ao gerar PDF de abastecimento:', error);
        alert('Erro ao gerar PDF. Verifique o console para mais detalhes.');
    }
}

function generateMaintenancePDF() {
    const records = getMaintenanceRecords();

    if (records.length === 0) {
        alert('Nenhum registro de manutenção para exportar!');
        return;
    }

    try {
        // Try to access jsPDF from window
        const jsPDFLib = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
        if (!jsPDFLib) {
            alert('Erro: Biblioteca jsPDF não carregada. Tente novamente.');
            console.error('jsPDF not available:', window.jspdf, window.jsPDF);
            return;
        }

        const doc = new jsPDFLib({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        let yPosition = 20;

        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('🚗 CarFlow - Histórico de Manutenção', 105, yPosition, { align: 'center' });

        // Date
        yPosition += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 105, yPosition, { align: 'center' });

        // Table
        yPosition += 15;
        const headers = ['Item', 'Data Troca', 'Odômetro', 'Próxima Troca'];
        const data = records.map(record => {
            const nextMaint = getNextMaintenanceForItem(record.itemId);
            let nextInfo = '—';

            if (nextMaint) {
                const parts = [];
                if (nextMaint.nextOdometer) {
                    parts.push(`${nextMaint.nextOdometer.toLocaleString('pt-BR')} KM`);
                }
                if (nextMaint.nextDate) {
                    const date = new Date(nextMaint.nextDate);
                    parts.push(date.toLocaleDateString('pt-BR'));
                }
                nextInfo = parts.length > 0 ? parts.join(' / ') : '—';
            }

            return [
                record.itemName,
                new Date(record.date).toLocaleDateString('pt-BR'),
                `${record.odometer.toLocaleString('pt-BR')} KM`,
                nextInfo
            ];
        });

        doc.autoTable({
            startY: yPosition,
            head: [headers],
            body: data,
            theme: 'grid',
            headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: 'bold' },
            bodyStyles: { textColor: [0, 0, 0] },
            margin: { top: 20 }
        });

        doc.save(`carflow-manutencao-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
        console.error('Erro ao gerar PDF de manutenção:', error);
        alert('Erro ao gerar PDF. Verifique o console para mais detalhes.');
    }
}

// ============================================================================
// Modal Functions
// ============================================================================

function closeFuelModal() {
    document.getElementById('editFuelModal').classList.remove('active');
    document.getElementById('editFuelForm').reset();
}

function closeMaintenanceModal() {
    document.getElementById('editMaintenanceModal').classList.remove('active');
    document.getElementById('editMaintenanceForm').reset();
}

function saveFuelEdit() {
    const id = parseInt(document.getElementById('editFuelModal').dataset.editId);
    const odometer = document.getElementById('editFuelOdometer').value;
    const liters = document.getElementById('editFuelLiters').value;
    const pricePerLiter = document.getElementById('editPricePerLiter').value;
    const totalSpent = document.getElementById('editTotalSpent').value;

    const result = calculateSmartFuel(liters, pricePerLiter, totalSpent);

    if (!result.liters || !result.pricePerLiter || !result.totalSpent) {
        alert('Preencha odômetro + 2 dos 3 campos de combustível!');
        return;
    }

    let logs = getFuelLogs();
    const logIndex = logs.findIndex(l => l.id === id);

    if (logIndex !== -1) {
        logs[logIndex].odometer = parseInt(odometer);
        logs[logIndex].liters = parseFloat(formatDecimal(result.liters, 2));
        logs[logIndex].pricePerLiter = parseFloat(formatDecimal(result.pricePerLiter, 2));
        logs[logIndex].totalSpent = parseFloat(formatDecimal(result.totalSpent, 2));

        // Recalculate efficiency
        if (logIndex > 0) {
            const previousLog = logs[logIndex - 1];
            const distanceTraveled = parseInt(odometer) - previousLog.odometer;
            if (distanceTraveled > 0 && previousLog.liters > 0) {
                logs[logIndex].efficiency = formatDecimal(distanceTraveled / previousLog.liters, 2);
                logs[logIndex].efficiencyClassification = getEfficiencyClassification(logs[logIndex].efficiency);
            }
        }

        saveData(STORAGE_KEYS.FUEL_LOGS, logs);
        updateUI();
        closeFuelModal();
    }
}

function saveMaintenanceEdit() {
    const id = parseInt(document.getElementById('editMaintenanceModal').dataset.editId);
    const date = document.getElementById('editMaintenanceDate').value;
    const odometer = document.getElementById('editMaintenanceOdometer').value;
    const intervalKM = document.getElementById('editMaintenanceIntervalKM').value;
    const intervalMonths = document.getElementById('editMaintenanceIntervalMonths').value;

    let records = getMaintenanceRecords();
    const recordIndex = records.findIndex(r => r.id === id);

    if (recordIndex !== -1) {
        records[recordIndex].date = date;
        records[recordIndex].odometer = parseInt(odometer);
        records[recordIndex].intervalKM = intervalKM ? parseInt(intervalKM) : null;
        records[recordIndex].intervalMonths = intervalMonths ? parseInt(intervalMonths) : null;

        saveData(STORAGE_KEYS.MAINTENANCE_RECORDS, records);
        updateUI();
        closeMaintenanceModal();
    }
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const fuelModal = document.getElementById('editFuelModal');
    const maintModal = document.getElementById('editMaintenanceModal');

    if (event.target === fuelModal) {
        closeFuelModal();
    }
    if (event.target === maintModal) {
        closeMaintenanceModal();
    }
});

// ============================================================================
// Event Listeners
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    // Check localStorage availability
    const localStorageWorks = checkLocalStorage();
    console.log('📦 localStorage disponível?', localStorageWorks);

    // Check if has saved data
    const savedLogs = getFuelLogs();
    const savedRecords = getMaintenanceRecords();

    console.log('🔍 Dados carregados:', {
        localStorage: localStorageWorks,
        abastecimentos: savedLogs.length,
        manutenções: savedRecords.length,
        logs: savedLogs,
        records: savedRecords
    });

    const text = document.getElementById('saveText');

    if (!localStorageWorks) {
        if (text) {
            text.textContent = '⚠️ localStorage desabilitado! Modo incógnito?';
            text.style.color = 'var(--warning-yellow)';
        }
        console.warn('⚠️ localStorage não está funcionando! Verificar modo incógnito ou permissões');
    } else if (savedLogs.length > 0 || savedRecords.length > 0) {
        if (text) {
            text.textContent = `✅ Carregados: ${savedLogs.length} abastecimentos, ${savedRecords.length} manutenções`;
            text.style.color = 'var(--success-green)';
        }
    } else {
        if (text) {
            text.textContent = '📝 Nenhum dado salvo - Comece a registrar!';
            text.style.color = 'var(--text-secondary)';
        }
    }

    // Initial UI load
    updateUI();
    setupSmartInputs();
    displayVehicleInfo();

    // Vehicle form submission
    document.getElementById('vehicleForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const brand = document.getElementById('vehicleBrand').value.trim();
        const model = document.getElementById('vehicleModel').value.trim();
        const year = document.getElementById('vehicleYear').value;

        saveVehicleInfo(brand, model, year);
        displayVehicleInfo();
        alert('✅ Informações do veículo salvas com sucesso!');
    });

    // Load maintenance targets into form
    const targets = getMaintenanceTargets();
    Object.entries(targets).forEach(([id, value]) => {
        const inputId = id + 'KM';
        const input = document.getElementById(inputId);
        if (input && value) {
            input.value = value;
        }
    });

    // Set today's date as default for maintenance
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('maintenanceDate').value = today;

    // Setup smart inputs for edit modals
    const editFuelModal = document.getElementById('editFuelModal');
    editFuelModal.addEventListener('shown', setupSmartInputs);

    // Edit fuel form submission
    document.getElementById('editFuelForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveFuelEdit();
    });

    // Edit maintenance form submission
    document.getElementById('editMaintenanceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveMaintenanceEdit();
    });

    // Fuel form submission
    document.getElementById('fuelForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const odometer = document.getElementById('fuelOdometer').value;
        const liters = document.getElementById('fuelLiters').value;
        const pricePerLiter = document.getElementById('pricePerLiter').value;
        const totalSpent = document.getElementById('totalSpent').value;
        const dateTime = document.getElementById('fuelDateTime').value;
        const gasStation = document.getElementById('fuelGasStation').value;

        if (!odometer) {
            alert('Odômetro é obrigatório!');
            return;
        }

        const result = calculateSmartFuel(liters, pricePerLiter, totalSpent);

        // Normalize and check
        const normalizedLiters = normalizeNumber(result.liters);
        const normalizedPrice = normalizeNumber(result.pricePerLiter);
        const normalizedTotal = normalizeNumber(result.totalSpent);

        if (!normalizedLiters || !normalizedPrice || !normalizedTotal) {
            alert('Preencha odômetro + 2 dos 3 campos de combustível!');
            return;
        }

        addFuelLog(odometer, normalizedLiters, normalizedPrice, normalizedTotal, dateTime, gasStation);
        updateUI();

        // Reset form
        this.reset();
    });

    // Maintenance form submission
    document.getElementById('maintenanceForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const itemId = document.getElementById('maintenanceItem').value;
        const date = document.getElementById('maintenanceDate').value;
        const odometer = document.getElementById('maintenanceOdometer').value;
        const intervalKM = document.getElementById('maintenanceIntervalKM').value;
        const intervalMonths = document.getElementById('maintenanceIntervalMonths').value;

        if (!itemId || !date || !odometer) {
            alert('Item, Data e Odômetro são obrigatórios!');
            return;
        }

        if (!intervalKM && !intervalMonths) {
            alert('Informe pelo menos um intervalo (KM ou Meses)!');
            return;
        }

        addMaintenanceRecord(itemId, date, odometer, intervalKM, intervalMonths);
        updateUI();

        // Reset form
        this.reset();
        document.getElementById('maintenanceDate').value = today;
    });

    // Maintenance targets form submission
    const targetsForm = document.getElementById('maintenanceTargetsForm');
    if (targetsForm) {
        targetsForm.addEventListener('submit', function(e) {
            e.preventDefault();

            Object.keys(MAINTENANCE_ITEMS).forEach(itemId => {
                const inputId = itemId + 'KM';
                const input = document.getElementById(inputId);
                if (input) {
                    const value = input.value;
                    setMaintenanceTarget(itemId, value);
                }
            });

            updateUI();
            alert('Todas as metas de manutenção foram atualizadas!');
        });
    } else {
        console.log('Formulário de metas não encontrado');
    }

    // PDF export buttons
    document.getElementById('printPdfBtn').addEventListener('click', generateMaintenancePDF);
    document.getElementById('printFuelPdfBtn').addEventListener('click', generateFuelPDF);

    // Camera buttons
    // Camera buttons - Fuel and Maintenance (both use choice modal)
    const cameraBtn = document.getElementById('cameraOdometerBtn');
    console.log('📷 Botão câmera (combustível):', cameraBtn);

    if (cameraBtn) {
        cameraBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('📷 Clicou no botão câmera (combustível)!');
            openCameraChoice();
        });
    }

    // Camera buttons - Maintenance
    const cameraMaintenanceBtn = document.getElementById('cameraMaintenanceBtn');
    if (cameraMaintenanceBtn) {
        cameraMaintenanceBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('📷 Clicou no botão câmera (manutenção)!');
            openCameraChoice();
        });
    }

    // Maintenance Photo Button (Attachment)
    const maintenancePhotoBtn = document.getElementById('maintenancePhotoBtn');
    if (maintenancePhotoBtn) {
        maintenancePhotoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('📷 Clicou para anexar comprovante!');
            cameraFieldType = 'receipt';
            openCameraChoice();
        });
    }

    const startBtn = document.getElementById('startCameraBtn');
    if (startBtn) {
        startBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('📷 Iniciando câmera...');
            startCamera();
        });
    }

    const captureBtn = document.getElementById('capturePhotoBtn');
    if (captureBtn) {
        captureBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('📸 Capturando foto...');
            capturePhoto();
        });
    }

    const retakeBtn = document.getElementById('retakeCameraBtn');
    if (retakeBtn) {
        retakeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔄 Refazendo foto...');
            retakePhoto();
        });
    }

    const usePhotoBtn = document.getElementById('useCameraPhotoBtn');
    if (usePhotoBtn) {
        usePhotoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('✅ Usando foto...');
            usePhoto();
        });
    }

    // Export data button
    document.getElementById('exportBtn').addEventListener('click', function() {
        const fuelLogs = getFuelLogs();
        const maintenanceRecords = getMaintenanceRecords();

        const data = {
            exportDate: new Date().toISOString(),
            fuelLogs: fuelLogs,
            maintenanceRecords: maintenanceRecords
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `carflow-dados-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });

    // Import data button
    document.getElementById('importBtn').addEventListener('click', function() {
        document.getElementById('importFileInput').click();
    });

    // Handle file import
    document.getElementById('importFileInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);

                if (!data.fuelLogs && !data.maintenanceRecords) {
                    alert('Arquivo inválido! Não contém dados de combustível ou manutenção.');
                    return;
                }

                if (confirm('Importar dados? Isso irá mesclar com os dados existentes.')) {
                    // Merge fuel logs
                    if (data.fuelLogs && Array.isArray(data.fuelLogs)) {
                        const currentLogs = getFuelLogs();
                        const mergedLogs = [...currentLogs];

                        data.fuelLogs.forEach(importedLog => {
                            if (!mergedLogs.find(l => l.id === importedLog.id)) {
                                mergedLogs.push(importedLog);
                            }
                        });

                        mergedLogs.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
                        saveData(STORAGE_KEYS.FUEL_LOGS, mergedLogs);
                    }

                    // Merge maintenance records
                    if (data.maintenanceRecords && Array.isArray(data.maintenanceRecords)) {
                        const currentRecords = getMaintenanceRecords();
                        const mergedRecords = [...currentRecords];

                        data.maintenanceRecords.forEach(importedRecord => {
                            if (!mergedRecords.find(r => r.id === importedRecord.id)) {
                                mergedRecords.push(importedRecord);
                            }
                        });

                        mergedRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                        saveData(STORAGE_KEYS.MAINTENANCE_RECORDS, mergedRecords);
                    }

                    updateUI();
                    alert('Dados importados com sucesso!');
                }
            } catch (error) {
                alert('Erro ao importar arquivo: ' + error.message);
            }
        };
        reader.readAsText(file);

        // Reset input
        e.target.value = '';
    });

    // Debug button
    document.getElementById('debugBtn').addEventListener('click', function() {
        const fuelLogs = getFuelLogs();
        const maintenanceRecords = getMaintenanceRecords();

        const debugData = {
            timestamp: new Date().toISOString(),
            abastecimentos: {
                quantidade: fuelLogs.length,
                dados: fuelLogs
            },
            manutenção: {
                quantidade: maintenanceRecords.length,
                dados: maintenanceRecords
            }
        };

        console.log('📊 DADOS COMPLETOS:', debugData);
        alert(`✅ Dados verificados!\n\nAbastecimentos: ${fuelLogs.length}\nManutenções: ${maintenanceRecords.length}\n\nVer console (F12) para detalhes`);
    });

    // Clear data button
    document.getElementById('clearBtn').addEventListener('click', function() {
        if (confirm('Você tem certeza que deseja deletar todos os dados? Esta ação não pode ser desfeita.')) {
            localStorage.removeItem(STORAGE_KEYS.FUEL_LOGS);
            localStorage.removeItem(STORAGE_KEYS.MAINTENANCE_RECORDS);
            updateUI();
            alert('Todos os dados foram deletados.');
        }
    });

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('Service Worker registrado com sucesso:', registration);
            })
            .catch(error => {
                console.log('Erro ao registrar Service Worker:', error);
            });
    }
});
