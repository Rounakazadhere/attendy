import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import { ArrowUpDown } from 'lucide-react';

const ClassWiseTable = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClassData();
    }, []);

    const fetchClassData = async () => {
        try {
            const res = await axios.get(`${config.API_URL}/api/dashboard/class-wise`);
            setClasses(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch class data");
            setLoading(false);
        }
    };

    if (loading) return <div className="text-slate-400">Loading class data...</div>;

    return (
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-200">Class-wise Attendance</h3>
                <button className="text-sm text-blue-400 hover:text-blue-300">Detailed View &rarr;</button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-950 text-slate-400 text-sm uppercase">
                            <th className="p-4 font-semibold border-b border-slate-800">Class</th>
                            <th className="p-4 font-semibold border-b border-slate-800">Total Students</th>
                            <th className="p-4 font-semibold border-b border-slate-800">Present</th>
                            <th className="p-4 font-semibold border-b border-slate-800">Absent</th>
                            <th className="p-4 font-semibold border-b border-slate-800 flex items-center gap-2 cursor-pointer hover:text-white">
                                Attendance % <ArrowUpDown size={14} />
                            </th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-300 divide-y divide-slate-800">
                        {classes.map((cls) => (
                            <tr key={cls.className} className="hover:bg-slate-800/50 transition-colors">
                                <td className="p-4 font-medium text-white">{cls.className}</td>
                                <td className="p-4">{cls.total}</td>
                                <td className="p-4 text-green-400">{cls.present}</td>
                                <td className="p-4 text-red-400">{cls.absent}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <span className={`font-bold ${parseFloat(cls.percentage) < 75 ? 'text-red-500' : 'text-green-500'}`}>
                                            {cls.percentage}%
                                        </span>
                                        <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${parseFloat(cls.percentage) < 75 ? 'bg-red-500' : 'bg-green-500'}`}
                                                style={{ width: `${cls.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {classes.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                    No class data available.
                </div>
            )}
        </div>
    );
};

export default ClassWiseTable;
