import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, Plus, Download, Split as SplitIcon, Trash2, FileSpreadsheet, X, AlertCircle, Loader2, FileText } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';

// Point pdfjs to its worker (bundled version)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
).toString();

export default function FinancialTracker() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newEntry, setNewEntry] = useState({ date: '', account: '', description: '', category: '', amount: '' });
    const [splitModal, setSplitModal] = useState({ isOpen: false, transactionId: null, originalAmount: 0, splits: [] });
    const [isParsing, setIsParsing] = useState(false);
    const [parseError, setParseError] = useState(null);
    const fileInputRef = useRef(null);

    // Load all transactions from Supabase on mount
    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Error loading transactions:', error.message);
        } else {
            setTransactions(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchTransactions(); }, [fetchTransactions]);


    const categories = [
        'Petrol', 'Eating Out', 'Gifts', 'Blessings / Donations', 'Medical / Dr',
        'Car Admin / Maintenance', 'Clothing', 'Toiletries', 'Electronics', 'Rent',
        'Home Garden', 'Alcohol', 'Groceries', 'Fees', 'Vacation', 'Sports & Fitness',
        'Hobbies', 'Education', 'Treats', 'Entertainment / Going Out', 'Phone / Data',
        'Skincare', 'Ouers', 'Personal Development', 'Birthday', 'Shoes', 'Accessories',
        'Parking', 'Government', 'Health', 'Emergency Fund', 'Subscriptions',
        'Investments', 'Insurance', 'Supplements', 'Tithe', 'Medical Aid / Hospital Plan',
        'Electricity', 'Water', 'Laser Hair Removal', 'Rent Extra (cleaning, house)',
        'Roadtrip', 'Cash Withdrawal', 'Other', 'Marieke Wedding'
    ];
    const accounts = ['Credit Card', 'Debit Card', 'Checking', 'Savings', 'Cash', 'Other'];

    const parsePdfTransactions = async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            // Sort items by Y position (top-to-bottom), then X (left-to-right)
            const items = content.items.sort((a, b) => {
                const yDiff = Math.round(b.transform[5]) - Math.round(a.transform[5]);
                if (Math.abs(yDiff) > 2) return yDiff;
                return a.transform[4] - b.transform[4];
            });
            // Group items into lines based on Y position
            const lines = [];
            let currentLine = [];
            let lastY = null;
            for (const item of items) {
                const y = Math.round(item.transform[5]);
                if (lastY !== null && Math.abs(y - lastY) > 4) {
                    if (currentLine.length) lines.push(currentLine.join(' ').trim());
                    currentLine = [];
                }
                currentLine.push(item.str);
                lastY = y;
            }
            if (currentLine.length) lines.push(currentLine.join(' ').trim());
            fullText += lines.join('\n') + '\n';
        }

        return extractTransactionsFromText(fullText);
    };

    const extractTransactionsFromText = (text) => {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);
        const transactions = [];

        // Support various date formats: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
        const dateRegex = /^(\d{2}[/-]\d{2}[/-]\d{4}|\d{4}-\d{2}-\d{2})/i;

        for (const line of lines) {
            const dateMatch = line.match(dateRegex);
            if (!dateMatch) continue;

            const rawDate = dateMatch[1];
            // Normalize date to YYYY-MM-DD for Supabase
            let date = rawDate;
            const dmyMatch = rawDate.match(/(\d{2})[/-](\d{2})[/-](\d{4})/);
            if (dmyMatch) date = `${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]}`;

            // Remove date from line to parse the rest
            const restOfLine = line.substring(rawDate.length).trim();

            // Extract all numeric values at the end of the line (In, Out, Fee, Balance)
            // This captures numbers like "1 234.56", "-50.00", "0.05", etc.
            const amountMatches = restOfLine.match(/-?[\d\s]+[.,]\d{2}/g);

            if (!amountMatches || amountMatches.length < 2) continue; // Need at least [Amount, Balance]

            // Description + Category is everything between date and the first amount
            const firstAmount = amountMatches[0];
            const rawDescLine = restOfLine.substring(0, restOfLine.indexOf(firstAmount)).trim();

            // Try to split Description and Category if there's a large gap (2+ spaces)
            let description = rawDescLine;
            let extractedCategory = 'Other';

            if (rawDescLine.includes('  ')) {
                const parts = rawDescLine.split(/\s{2,}/);
                if (parts.length >= 2) {
                    extractedCategory = parts.pop().trim();
                    description = parts.join('  ').trim();
                }
            }

            // The last amount is ALWAYS the Balance in SA bank statements - we discard it
            const balance = amountMatches.pop();

            // Smart Category Mapping
            const mapCategory = (cat, desc) => {
                const lowerCat = cat.toLowerCase();
                const lowerDesc = desc.toLowerCase();

                if (lowerCat.includes('restaurant') || lowerCat.includes('takeaway') || lowerDesc.includes('checkers sixty60')) return 'Eating Out';
                if (lowerCat.includes('fuel') || lowerDesc.includes('engen') || lowerDesc.includes('shell') || lowerDesc.includes('sasol')) return 'Petrol';
                if (lowerCat.includes('grocer') || lowerDesc.includes('woolworths') || lowerDesc.includes('checkers') || lowerDesc.includes('pnp') || lowerDesc.includes('spar')) return 'Groceries';
                if (lowerCat.includes('pharmacy') || lowerCat.includes('medical')) return 'Medical / Dr';
                if (lowerCat.includes('parking')) return 'Parking';
                if (lowerCat.includes('education')) return 'Education';
                if (lowerCat.includes('interest') || lowerCat.includes('fee')) return 'Fees';
                if (lowerCat.includes('transfer')) return 'Other';

                // Try to find a direct match in the user's list
                const match = categories.find(c => c.toLowerCase() === lowerCat);
                return match || 'Other';
            };

            // Remaining amounts are either [MoneyIn/Out] or [MoneyIn/Out, Fee]
            amountMatches.forEach((rawAmt, index) => {
                const amount = parseFloat(rawAmt.replace(/\s/g, '').replace(',', '.'));
                if (Math.abs(amount) < 0.01) return;

                const isFee = index === 1 || description.toLowerCase().includes('fee');
                const finalCategory = isFee ? 'Fees' : mapCategory(extractedCategory, description);

                transactions.push({
                    date,
                    account: 'Other',
                    description: isFee && !description.toLowerCase().includes('fee')
                        ? `${description} (Bank Fee)`
                        : description,
                    category: finalCategory,
                    amount: Math.abs(amount),
                    type: amount < 0 ? 'expense' : 'income'
                });
            });
        }

        return transactions;
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileExt = file.name.split('.').pop().toLowerCase();
        setParseError(null);

        if (fileExt === 'pdf') {
            setIsParsing(true);
            try {
                const parsed = await parsePdfTransactions(file);
                if (parsed.length === 0) {
                    setParseError('No transactions found. Ensure this is a digital bank statement (not a scan).');
                } else {
                    // Filter out internal IDs and insert into Supabase
                    const { data: inserted, error } = await supabase
                        .from('transactions')
                        .insert(parsed)
                        .select();

                    if (error) throw error;
                    setTransactions(prev => [...(inserted || []), ...prev]);
                }
            } catch (err) {
                console.error('PDF parse error:', err);
                setParseError('Failed to read the PDF format. Try CSV or Excel if available.');
            } finally {
                setIsParsing(false);
            }
        } else if (fileExt === 'csv') {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    processData(results.data);
                }
            });
        } else if (fileExt === 'xlsx' || fileExt === 'xls') {
            const reader = new FileReader();
            reader.onload = async (evt) => {
                const data = evt.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
                await processData(jsonData);
            };
            reader.readAsBinaryString(file);
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const processData = async (data) => {
        const mapped = data.map(row => {
            const getVal = (possibleNames) => {
                const key = Object.keys(row).find(k => possibleNames.includes(k.toLowerCase().trim()));
                return key ? row[key] : '';
            };

            const amountVal = getVal(['amount', 'value', 'price', 'debit', 'credit', 'amount(zar)', 'amount (zar)']);

            return {
                id: crypto.randomUUID(),
                date: getVal(['date', 'transaction date', 'posting date']) || new Date().toISOString().split('T')[0],
                account: getVal(['account', 'card', 'bank', 'source']) || 'Other',
                description: getVal(['description', 'memo', 'narration', 'payee', 'title']) || 'Unknown Transaction',
                category: getVal(['category', 'type']) || 'Other',
                amount: parseFloat(amountVal) || 0,
            };
        }).filter(t => t.description !== 'Unknown Transaction' || t.amount !== 0);

        // Insert all mapped rows into Supabase
        const toInsert = mapped.map(({ id, ...rest }) => rest); // let DB generate UUIDs
        const { data: insertedData, error } = await supabase.from('transactions').insert(toInsert).select();
        if (error) {
            console.error('Error saving imported transactions:', error.message);
            alert('Some transactions could not be saved. Please try again.');
        } else {
            setTransactions(prev => [...(insertedData || []), ...prev]);
        }
    };

    const handleManualAdd = async (e) => {
        e.preventDefault();
        if (!newEntry.amount || !newEntry.description) return;

        const row = {
            date: newEntry.date || new Date().toISOString().split('T')[0],
            account: newEntry.account || 'Other',
            description: newEntry.description,
            category: newEntry.category || 'Other',
            amount: parseFloat(newEntry.amount)
        };

        const { data, error } = await supabase.from('transactions').insert(row).select().single();
        if (error) {
            console.error('Error adding transaction:', error.message);
            alert('Could not save transaction. Please try again.');
            return;
        }
        setTransactions(prev => [data, ...prev]);
        setNewEntry({ date: '', account: '', description: '', category: '', amount: '' });
    };

    const deleteTransaction = async (id) => {
        if (!confirm('Are you sure you want to delete this transaction?')) return;
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) {
            console.error('Error deleting transaction:', error.message);
            alert('Could not delete transaction. Please try again.');
            return;
        }
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    const updateTransaction = async (id, field, value) => {
        // Optimistically update UI first
        setTransactions(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
        const { error } = await supabase.from('transactions').update({ [field]: value }).eq('id', id);
        if (error) {
            console.error('Error updating transaction:', error.message);
            // Revert on failure
            fetchTransactions();
        }
    };

    const openSplitModal = (t) => {
        setSplitModal({
            isOpen: true,
            transactionId: t.id,
            originalAmount: t.amount,
            splits: [
                { id: crypto.randomUUID(), amount: t.amount, category: t.category, description: t.description },
                { id: crypto.randomUUID(), amount: 0, category: 'Other', description: '' }
            ]
        });
    };

    const closeSplitModal = () => {
        setSplitModal({ isOpen: false, transactionId: null, originalAmount: 0, splits: [] });
    };

    const addSplitRow = () => {
        setSplitModal(prev => ({
            ...prev,
            splits: [...prev.splits, { id: crypto.randomUUID(), amount: 0, category: 'Other', description: '' }]
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

    const handleSaveSplit = async () => {
        const totalSplit = splitModal.splits.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);

        // Rounding logic for floating point comparison
        if (Math.abs(totalSplit - splitModal.originalAmount) > 0.01) {
            alert(`Split amounts must equal the original amount exactly. \nOriginal: R${splitModal.originalAmount.toFixed(2)} \nSplit Total: R${totalSplit.toFixed(2)}`);
            return;
        }

        const tOriginal = transactions.find(t => t.id === splitModal.transactionId);

        // Guard against the original transaction being deleted before saving
        if (!tOriginal) {
            alert('The original transaction could not be found. Please close and try again.');
            closeSplitModal();
            return;
        }

        const splitRows = splitModal.splits
            .filter(s => parseFloat(s.amount || 0) !== 0)
            .map(s => ({
                date: tOriginal.date,
                account: tOriginal.account,
                amount: parseFloat(s.amount),
                category: s.category,
                description: s.description || tOriginal.description + ' (Split)'
            }));

        // Delete the original row, then insert the splits
        const { error: delError } = await supabase.from('transactions').delete().eq('id', splitModal.transactionId);
        if (delError) {
            console.error('Error removing original transaction during split:', delError.message);
            alert('Split failed. Please try again.');
            return;
        }
        const { data: inserted, error: insError } = await supabase.from('transactions').insert(splitRows).select();
        if (insError) {
            console.error('Error inserting split rows:', insError.message);
            alert('Split rows could not be saved. Please try again.');
            // Re-fetch to restore consistent state
            fetchTransactions();
            closeSplitModal();
            return;
        }

        setTransactions(prev => {
            const filtered = prev.filter(t => t.id !== splitModal.transactionId);
            return [...(inserted || []), ...filtered];
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
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isParsing}
                        className="btn"
                        style={{ background: 'var(--color-wealth-bg)', color: 'var(--color-wealth)', opacity: isParsing ? 0.7 : 1 }}
                    >
                        {isParsing ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={18} />}
                        {isParsing ? 'Reading PDF...' : 'Upload Bank File'}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv, .xlsx, .xls, .pdf" style={{ display: 'none' }} />
                    <button onClick={handleExport} className="btn" style={{ background: 'var(--color-wealth)', color: 'white' }}>
                        <Download size={18} /> Export Data
                    </button>
                </div>
            </header>

            {/* PDF Tip Banner */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.85rem 1.1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <FileText size={16} style={{ flexShrink: 0, marginTop: '1px', color: 'var(--color-wealth)' }} />
                <span>Supported formats: <strong style={{ color: 'white' }}>PDF</strong> (text-based bank statements), <strong style={{ color: 'white' }}>CSV</strong>, and <strong style={{ color: 'white' }}>Excel</strong>. PDFs must be digital text — scanned/image PDFs won't work.</span>
            </div>

            {/* Parse Error Banner */}
            {parseError && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.85rem 1.1rem', background: 'var(--color-love-bg)', border: '1px solid rgba(255,80,80,0.25)', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.88rem', color: 'var(--color-love)' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                    <span>{parseError}</span>
                    <button onClick={() => setParseError(null)} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--color-love)', cursor: 'pointer', padding: 0 }}><X size={16} /></button>
                </div>
            )}

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
