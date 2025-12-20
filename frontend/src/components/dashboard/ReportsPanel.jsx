import React, { useState } from 'react';
import axios from 'axios';
import config from '../../config';
import { Download, FileText, Calendar, Filter } from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

const ReportsPanel = () => {
    const [reportType, setReportType] = useState('daily');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    // MOCK DATA GENERATORS (Ideally fetch from /api/reports)

    const generatePDF = async () => {
        setLoading(true);
        // Simulate API call
        // const res = await axios.get(...)

        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.text("Government Primary School", 105, 20, null, null, "center");
        doc.setFontSize(14);
        doc.text("Daily Attendance Report", 105, 30, null, null, "center");
        doc.setFontSize(10);
        doc.text(`Date: ${date}`, 105, 36, null, null, "center");

        // Line
        doc.line(20, 40, 190, 40);

        // Content
        doc.setFontSize(12);
        doc.text("Summary:", 20, 50);
        doc.setFontSize(10);
        doc.text("- Total Students: 120", 25, 60);
        doc.text("- Present: 105 (87.5%)", 25, 66);
        doc.text("- Absent: 15", 25, 72);

        doc.text("- Total Teachers: 8", 120, 60);
        doc.text("- Present: 7", 120, 66);
        doc.text("- Late: 1", 120, 72);

        // Table Mockup
        doc.rect(20, 80, 170, 100);
        doc.text("[Detailed Class-wise data would appear here in real implementation]", 30, 100);

        // Footer
        doc.text("Principal Signature", 160, 250, null, null, "right");

        doc.save(`Attendance_Report_${date}.pdf`);
        setLoading(false);
    };

    const generateExcel = () => {
        setLoading(true);
        const wb = XLSX.utils.book_new();

        const data = [
            ["Date", "Class", "Total", "Present", "Absent", "%"],
            [date, "1A", 30, 28, 2, "93%"],
            [date, "2A", 32, 30, 2, "94%"],
            [date, "3A", 28, 25, 3, "89%"],
            [date, "4A", 30, 20, 10, "66%"],
            [date, "5A", 30, 29, 1, "96%"],
        ];

        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Attendance");
        XLSX.writeFile(wb, `Attendance_Report_${date}.xlsx`);
        setLoading(false);
    };

    return (
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FileText className="text-blue-500" /> Generate Reports
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                    <label className="block text-slate-400 text-sm mb-2">Report Type</label>
                    <select
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500"
                        value={reportType}
                        onChange={e => setReportType(e.target.value)}
                    >
                        <option value="daily">Daily Attendance</option>
                        <option value="monthly">Monthly Summary</option>
                        <option value="teacher">Teacher Performance</option>
                        <option value="dropout">Low Attendance List</option>
                    </select>
                </div>

                <div>
                    <label className="block text-slate-400 text-sm mb-2">Select Date / Month</label>
                    <input
                        type="date"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-slate-400 text-sm mb-2">Filter Class (Optional)</label>
                    <div className="relative">
                        <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 appearance-none">
                            <option value="">All Classes</option>
                            <option value="1">Class 1</option>
                            <option value="2">Class 2</option>
                            <option value="5">Class 5</option>
                        </select>
                        <Filter size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    </div>
                </div>
            </div>

            <div className="flex gap-4 border-t border-slate-800 pt-8">
                <button
                    onClick={generatePDF}
                    disabled={loading}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download size={20} />
                    {loading ? "Generating..." : "Download PDF"}
                </button>

                <button
                    onClick={generateExcel}
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download size={20} />
                    {loading ? "Generating..." : "Download Excel"}
                </button>
            </div>

            <p className="text-center text-slate-500 text-sm mt-6">
                * Reports are generated based on data synced to the server. Offline records will appear after synchronization.
            </p>
        </div>
    );
};

export default ReportsPanel;
