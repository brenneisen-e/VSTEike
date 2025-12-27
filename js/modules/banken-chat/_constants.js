/**
 * Banken Chat Module - Constants
 * Demo customer and payment data for Collections Dashboard
 */

/**
 * Demo customer data for testing and demonstration
 * @type {Array<{id: string, name: string, forderung: number, dpd: number, segment: string, status: string}>}
 */
export const DEMO_CUSTOMER_DATA = [
    { id: 'K-2024-0001', name: 'Mueller GmbH', forderung: 125000, dpd: 35, segment: 'eskalation', status: 'Inkasso' },
    { id: 'K-2024-0002', name: 'Schmidt, Peter', forderung: 8450, dpd: 21, segment: 'prioritaet', status: 'Offen' },
    { id: 'K-2024-0003', name: 'Weber KG', forderung: 45780, dpd: 14, segment: 'restrukturierung', status: 'Vereinbarung' },
    { id: 'K-2024-0004', name: 'Braun, Maria', forderung: 3210, dpd: 67, segment: 'abwicklung', status: 'Abschreibung' },
    { id: 'K-2024-0005', name: 'Hoffmann Bau GmbH', forderung: 287500, dpd: 48, segment: 'eskalation', status: 'Inkasso' },
    { id: 'K-2024-0006', name: 'Keller, Thomas', forderung: 15800, dpd: 42, segment: 'eskalation', status: 'Inkasso' },
    { id: 'K-2024-0007', name: 'Autohaus Berger', forderung: 89300, dpd: 55, segment: 'eskalation', status: 'Inkasso' },
    { id: 'K-2024-0008', name: 'Lehmann, Sandra', forderung: 12650, dpd: 18, segment: 'prioritaet', status: 'Offen' },
    { id: 'K-2024-0009', name: 'Meier Elektro OHG', forderung: 34200, dpd: 25, segment: 'prioritaet', status: 'Offen' },
    { id: 'K-2024-0010', name: 'Fischer, Hans', forderung: 6890, dpd: 12, segment: 'prioritaet', status: 'Zusage' },
    { id: 'K-2024-0011', name: 'Bäckerei Schulze', forderung: 67400, dpd: 28, segment: 'restrukturierung', status: 'Vereinbarung' },
    { id: 'K-2024-0012', name: 'Neumann, Klaus', forderung: 156000, dpd: 8, segment: 'restrukturierung', status: 'Vereinbarung' },
    { id: 'K-2024-0013', name: 'Gasthaus zum Löwen', forderung: 112800, dpd: 19, segment: 'restrukturierung', status: 'Vereinbarung' },
    { id: 'K-2024-0014', name: 'Werner, Sabine', forderung: 4560, dpd: 92, segment: 'abwicklung', status: 'Abschreibung' },
    { id: 'K-2024-0015', name: 'Maier Transporte', forderung: 78900, dpd: 78, segment: 'abwicklung', status: 'Abschreibung' },
    { id: 'K-2024-0016', name: 'Zimmermann, Frank', forderung: 2340, dpd: 105, segment: 'abwicklung', status: 'Abschreibung' },
    { id: 'K-2024-8847', name: 'Müller, Hans', forderung: 4230, dpd: 2, segment: 'prioritaet', status: 'Offen' },
    { id: 'K-2024-8846', name: 'Schmidt GmbH', forderung: 12890, dpd: 3, segment: 'prioritaet', status: 'Offen' },
    { id: 'K-2024-8845', name: 'Weber, Anna', forderung: 2150, dpd: 5, segment: 'prioritaet', status: 'Offen' },
    { id: 'K-2024-7234', name: 'Braun, Thomas', forderung: 1890, dpd: 0, segment: 'abgeschlossen', status: 'Bezahlt' },
    { id: 'K-2024-6891', name: 'Klein KG', forderung: 8400, dpd: 0, segment: 'abgeschlossen', status: 'Bezahlt' },
    { id: 'K-2024-6234', name: 'Fischer, Maria', forderung: 780, dpd: 0, segment: 'abgeschlossen', status: 'Bezahlt' },
    { id: 'K-2024-5982', name: 'Meier, Stefan', forderung: 2340, dpd: 0, segment: 'abgeschlossen', status: 'Bezahlt' },
    { id: 'K-2024-5876', name: 'Schneider Logistik GmbH', forderung: 15200, dpd: 0, segment: 'abgeschlossen', status: 'Bezahlt' },
    { id: 'K-2024-5734', name: 'Fischer, Anna', forderung: 3450, dpd: 0, segment: 'abgeschlossen', status: 'Bezahlt' },
    { id: 'K-2024-5612', name: 'Bäckerei Müller', forderung: 24800, dpd: 0, segment: 'abgeschlossen', status: 'Bezahlt' }
];

/**
 * Demo payment data for testing and demonstration
 * @type {Array<{id: string, kundeId: string, kunde: string, betrag: number, datum: string, art: string}>}
 */
export const DEMO_PAYMENTS = [
    { id: 'Z-2024-1234', kundeId: 'K-2024-0010', kunde: 'Fischer, Hans', betrag: 2500, datum: '2025-12-15', art: 'Teilzahlung' },
    { id: 'Z-2024-1235', kundeId: 'K-2024-0003', kunde: 'Weber KG', betrag: 8900, datum: '2025-12-14', art: 'Ratenzahlung' },
    { id: 'Z-2024-1236', kundeId: 'K-2024-0012', kunde: 'Neumann, Klaus', betrag: 15600, datum: '2025-12-14', art: 'Ratenzahlung' },
    { id: 'Z-2024-1237', kundeId: 'K-2024-0002', kunde: 'Schmidt, Peter', betrag: 3200, datum: '2025-12-13', art: 'Teilzahlung' },
    { id: 'Z-2024-1238', kundeId: 'K-2024-0011', kunde: 'Bäckerei Schulze', betrag: 5400, datum: '2025-12-12', art: 'Ratenzahlung' },
    { id: 'Z-2024-1239', kundeId: 'K-2024-0008', kunde: 'Lehmann, Sandra', betrag: 4800, datum: '2025-12-11', art: 'Teilzahlung' },
    { id: 'Z-2024-1240', kundeId: 'K-2024-0013', kunde: 'Gasthaus zum Löwen', betrag: 12100, datum: '2025-12-10', art: 'Ratenzahlung' }
];
