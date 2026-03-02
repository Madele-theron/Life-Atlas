import { useState, useRef } from 'react';
import { Upload, Plus, Download, Split as SplitIcon, Trash2, FileSpreadsheet, X, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export default function FinancialTracker() {
    const [transactions, setTransactions] = useState([]);
    const [newEntry, setNewEntry] = useState({ date: '', account: '', description: '', category: '', amount: '' });
    const [splitModal, setSplitModal] = useState({ isOpen: false, transactionId: null, originalAmount: 0, splits: [] });
    const fileInputRef = useRef(null);

    const categories = ['Groceries', 'Gifts', 'Petrol', 'To Be Paid Back', 'Treats', 'Income', 'Other'];
    const accounts = ['Credit Card', 'Debit Card', 'Checking', 'Savings', 'Cash', 'Other'];

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileExt = file.name.split('.').pop().toLowerCase();

        if (fileExt === 'csv') {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    processData(results.data);
                }
            });
        } else if (fileExt === 'xlsx' || fileExt === 'xls') {
            const reader = new FileReader();
            reader.onload = (evt) => {
                const data = evt.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
                processData(jsonData);
            };
            reader.readAsBinaryString(file);
        }

        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const processData = (data) => {
        const mapped = data.map(row => {
            const getVal = (possibleNames) => {
                const key = Object.keys(row).find(k => possibleNames.includes(k.toLowerCase().trim()));
                return key ? row[key] : '';
            };

            const amountVal = getVal(['amount', 'value', 'price', 'debit', 'credit', 'amount(zar)', 'amount (zar)']);

            return {
                id: Date.now() + Math.random().toString(36).substring(2, 9),
                date: getVal(['date', 'transaction date', 'posting date']) || new Date().toISOString().split('T')[0],
                account: getVal(['account', 'card', 'bank', 'source']) || 'Other',
                description: getVal(['description', 'memo', 'narration', 'payee', 'title']) || 'Unknown Transaction',
                category: getVal(['category', 'type']) || 'Other',
                amount: parseFloat(amountVal) || 0,
            };
        }).filter(t => t.description !== 'Unknown Transaction' || t.amount !== 0);

        setTransactions(prev => [...prev, ...mapped]);
    };

    const handleManualAdd = (e) => {
        e.preventDefault();
        if (!newEntry.amount || !newEntry.description) return;

        setTransactions([{
            id: Date.now().toString(),
            date: newEntry.date || new Date().toISOString().split('T')[0],
            account: newEntry.account || 'Other',
            description: newEntry.description,
            category: newEntry.category || 'Other',
            amount: parseFloat(newEntry.amount)
        }, ...transactions]);

        setNewEntry({ date: '', account: '', description: '', category: '', amount: '' });
    };

    const deleteTransaction = (id) => {
        if (confirm("Are you sure you want to delete this transaction?")) {
            setTransactions(transactions.filter(t => t.id !== id));
        }
    };

    const updateTransaction = (id, field, value) => {
        setTransactions(transactions.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    const openSplitModal = (t) => {
        setSplitModal({
            isOpen: true,
            transactionId: t.id,
            originalAmount: t.amount,
            splits: [
                { id: Date.now().toString() + '1', amount: t.amount, category: t.category, description: t.description },
                { id: Date.now().toString() + '2', amount: 0, category: 'Other', description: '' }
            ]
        });
    };

    const closeSplitModal = () => {
        setSplitModal({ isOpen: false, transactionId: null, originalAmount: 0, splits: [] });
    };

    const addSplitRow = () => {
        setSplitModal(prev => ({
            ...prev,
            splits: [...prev.splits, { id: Date.now().toString(), amount: 0, category: 'Other', description: '' }]
        }));
    };

    const updateSplitRow = (id, field, value) => {
        setSplitModal(prev => ({
            ...prev,
            splits: prev.splits.map(s => s.id === id ? { ...s, [field]: value } : s)
        }));
    };

    const removeSplitRow = (id) => {
        if (splitModal.splits.length <= 2) return; // Maintain at least 2 rows
        setSplitModal(prev => ({
            ...prev,
            splits: prev.splits.filter(s => s.id !== id)
        }));
    };

    const handleSaveSplit = () => {
        const totalSplit = splitModal.splits.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);

        // Rounding logic for floating point comparison
        if (Math.abs(totalSplit - splitModal.originalAmount) > 0.01) {
            alert(`Split amounts must equal the original amount exactly. \nOriginal: R${splitModal.originalAmount.toFixed(2)} \nSplit Total: R${totalSplit.toFixed(2)}`);
            return;
        }

        const tOriginal = transactions.find(t => t.id === splitModal.transactionId);

        const newTransactions = splitModal.splits
            .filter(s => parseFloat(s.amount || 0) !== 0)
            .map(s => ({
                ...tOriginal,
                id: Date.now() + Math.random().toString(36).substring(2, 9),
                amount: parseFloat(s.amount),
                category: s.category,
                description: s.description || tOriginal.description + ' (Split)'
            }));

        setTransactions(prev => {
            const index = prev.findIndex(t => t.id === splitModal.transactionId);
            if (index === -1) return prev;
            const newArr = [...prev];
            newArr.splice(index, 1, ...newTransactions);
            return newArr;
        });

        closeSplitModal();
    };

    const handleExport = () => {
        if (transactions.length === 0) {
            alert("No data to export!");
            return;
        }

        // Prepare data for export without the internal 'id'
        const exportData = transactions.map(({ id, ...rest }) => ({
            Date: rest.date,
            Account: rest.account,
            Description: rest.description,
            Category: rest.category,
            Amount: rest.amount
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Transactions");
        XLSX.writeFile(wb, "Categorized_Transactions.xlsx");
    };

    const splitTotal = splitModal.splits.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);
    const isSplitValid = Math.abs(splitTotal - splitModal.originalAmount) <= 0.01;

    return (
        <div className="fade-in" style={{ position: 'relative' }}>
            <header className="mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>Financial Tracker</h1>
                    <p>Upload statements, categorize, and split transactions effortlessly.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => fileInputRef.current?.click()} className="btn" style={{ background: 'var(--color-wealth-bg)', color: 'var(--color-wealth)' }}>
                        <Upload size={18} /> Upload Bank File
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv, .xlsx, .xls" style={{ display: 'none' }} />
                    <button onClick={handleExport} className="btn" style={{ background: 'var(--color-wealth)', color: 'white' }}>
                        <Download size={18} /> Export Data
                    </button>
                </div>
            </header>

            {/* Manual Entry Form */}
            <div className="card mb-8">
                <h3 className="mb-4" style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} className="text-wealth" /> Add Single Transaction
                </h3>
                <form onSubmit={handleManualAdd} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                    <div style={{ flex: '1 1 150px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>Date</label>
                        <input type="date" value={newEntry.date} onChange={e => setNewEntry({ ...newEntry, date: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-glass)', background: 'var(--bg-dark)', color: 'white' }} />
                    </div>
                    <div style={{ flex: '1 1 150px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>Account</label>
                        <select value={newEntry.account} onChange={e => setNewEntry({ ...newEntry, account: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-glass)', background: 'var(--bg-dark)', color: 'white' }}>
                            <option value="">Select Account...</option>
                            {accounts.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: '2 1 200px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>Description *</label>
                        <input type="text" placeholder="E.g., Checkers Supermarket" required value={newEntry.description} onChange={e => setNewEntry({ ...newEntry, description: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-glass)', background: 'var(--bg-dark)', color: 'white' }} />
                    </div>
                    <div style={{ flex: '1 1 150px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>Category</label>
                        <select value={newEntry.category} onChange={e => setNewEntry({ ...newEntry, category: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-glass)', background: 'var(--bg-dark)', color: 'white' }}>
                            <option value="">Select Category...</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: '1 1 120px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>Amount (R) *</label>
                        <input type="number" step="0.01" placeholder="0.00" required value={newEntry.amount} onChange={e => setNewEntry({ ...newEntry, amount: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-glass)', background: 'var(--bg-dark)', color: 'white' }} />
                    </div>
                    <div style={{ flex: '0 0 auto' }}>
                        <button type="submit" className="btn" style={{ padding: '0.6rem 1.2rem', background: 'var(--color-wealth)', color: 'white', height: '42px' }}>
                            Add
                        </button>
                    </div>
                </form>
            </div>

            {/* Transactions Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-glass)' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FileSpreadsheet className="text-wealth" size={24} /> Transactions Ledger
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginLeft: 'auto', fontWeight: 'normal' }}>
                            {transactions.length} items
                        </span>
                    </h2>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    {transactions.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-dark)', color: 'var(--text-muted)' }}>
                                    <th style={{ padding: '1rem 1.5rem', fontWeight: '500' }}>Date</th>
                                    <th style={{ padding: '1rem 1.5rem', fontWeight: '500' }}>Account</th>
                                    <th style={{ padding: '1rem 1.5rem', fontWeight: '500' }}>Description</th>
                                    <th style={{ padding: '1rem 1.5rem', fontWeight: '500' }}>Category</th>
                                    <th style={{ padding: '1rem 1.5rem', fontWeight: '500' }}>Amount</th>
                                    <th style={{ padding: '1rem 1.5rem', fontWeight: '500', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((t, index) => (
                                    <tr key={t.id} style={{ borderBottom: index < transactions.length - 1 ? '1px solid var(--border-glass)' : 'none', transition: 'background-color 0.2s', ':hover': { backgroundColor: 'var(--bg-dark)' } }}>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <input type="date" value={t.date} onChange={(e) => updateTransaction(t.id, 'date', e.target.value)} style={{ background: 'transparent', border: '1px solid transparent', color: 'white', padding: '0.2rem', borderRadius: '4px', cursor: 'text' }} />
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <select value={t.account} onChange={(e) => updateTransaction(t.id, 'account', e.target.value)} style={{ background: 'transparent', border: '1px solid transparent', color: 'white', padding: '0.2rem', borderRadius: '4px', cursor: 'pointer' }}>
                                                {accounts.map(a => <option key={a} value={a} style={{ background: 'var(--bg-page)' }}>{a}</option>)}
                                                {!accounts.includes(t.account) && <option value={t.account} style={{ background: 'var(--bg-page)' }}>{t.account}</option>}
                                            </select>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <input type="text" value={t.description} onChange={(e) => updateTransaction(t.id, 'description', e.target.value)} style={{ background: 'transparent', border: '1px solid transparent', color: 'white', padding: '0.2rem', borderRadius: '4px', cursor: 'text', width: '100%', minWidth: '150px' }} />
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <select value={t.category} onChange={(e) => updateTransaction(t.id, 'category', e.target.value)} style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-glass)', color: t.category !== 'Other' && t.category ? 'var(--color-wealth)' : 'white', padding: '0.4rem 0.6rem', borderRadius: '6px', cursor: 'pointer', outline: 'none' }}>
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                                {!categories.includes(t.category) && t.category && <option value={t.category}>{t.category}</option>}
                                            </select>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', fontWeight: '500' }}>
                                            <input type="number" step="0.01" value={t.amount} onChange={(e) => updateTransaction(t.id, 'amount', e.target.value)} style={{ background: 'transparent', border: '1px solid transparent', color: 'white', padding: '0.2rem', borderRadius: '4px', cursor: 'text', width: '100px', fontWeight: 'inherit' }} />
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                <button onClick={() => openSplitModal(t)} className="btn" style={{ padding: '0.4rem 0.6rem', background: 'var(--color-wealth-bg)', color: 'var(--color-wealth)' }} title="Split Transaction">
                                                    <SplitIcon size={16} /> Split
                                                </button>
                                                <button onClick={() => deleteTransaction(t.id)} className="btn" style={{ padding: '0.4rem 0.6rem', background: 'var(--color-love-bg)', color: 'var(--color-love)' }} title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <FileSpreadsheet size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No transactions recorded yet.</p>
                            <p style={{ fontSize: '0.9rem' }}>Add a manual entry above or upload a bank file to get started.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Split Modal Overlay */}
            {splitModal.isOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5,5,5,0.8)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="card" style={{ width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-glass)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><SplitIcon className="text-wealth" size={24} /> Split Transaction</h2>
                            <button onClick={closeSplitModal} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ background: 'var(--bg-dark)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Original Amount</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>R{splitModal.originalAmount.toFixed(2)}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Difference</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: isSplitValid ? 'var(--color-wealth)' : 'var(--color-love)' }}>
                                    R{Math.abs(splitModal.originalAmount - splitTotal).toFixed(2)}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                            {splitModal.splits.map((split, index) => (
                                <div key={split.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                    <div style={{ flex: '1' }}>
                                        <input type="number" step="0.01" value={split.amount} onChange={e => updateSplitRow(split.id, 'amount', e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-glass)', background: 'var(--bg-page)', color: 'white' }} placeholder="Amount" />
                                    </div>
                                    <div style={{ flex: '1.5' }}>
                                        <input type="text" value={split.description} onChange={e => updateSplitRow(split.id, 'description', e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-glass)', background: 'var(--bg-page)', color: 'white' }} placeholder="Optional Description" />
                                    </div>
                                    <div style={{ flex: '1' }}>
                                        <select value={split.category} onChange={e => updateSplitRow(split.id, 'category', e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: `1px solid ${split.category !== 'Other' ? 'var(--color-wealth)' : 'var(--border-glass)'}`, background: 'var(--bg-page)', color: 'white', outline: 'none' }}>
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    {splitModal.splits.length > 2 && (
                                        <button onClick={() => removeSplitRow(split.id)} style={{ padding: '0.6rem', background: 'var(--color-love-bg)', color: 'var(--color-love)', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button onClick={addSplitRow} style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: '1px dashed var(--border-glass)', color: 'var(--text-muted)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <Plus size={18} /> Add Split Row
                        </button>

                        {!isSplitValid && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-love)', fontSize: '0.9rem', marginBottom: '1rem', padding: '0.75rem', background: 'var(--color-love-bg)', borderRadius: '6px' }}>
                                <AlertCircle size={18} /> The split amounts must exactly add up to the original amount to save.
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button onClick={closeSplitModal} className="btn" style={{ background: 'transparent', border: '1px solid var(--border-glass)', color: 'white' }}>Cancel</button>
                            <button onClick={handleSaveSplit} disabled={!isSplitValid} className="btn" style={{ background: isSplitValid ? 'var(--color-wealth)' : 'var(--bg-dark)', color: isSplitValid ? 'white' : 'var(--text-muted)', cursor: isSplitValid ? 'pointer' : 'not-allowed', border: 'none' }}>
                                Save Splits
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
