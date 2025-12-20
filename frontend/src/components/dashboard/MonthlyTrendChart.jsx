import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import config from '../../config';

const MonthlyTrendChart = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        fetchTrendData();
    }, []);

    const fetchTrendData = async () => {
        try {
            const res = await axios.get(`${config.API_URL}/api/analytics/monthly-trend`);
            setData(res.data);
        } catch (err) {
            console.error("Failed to fetch trend data");
            // Fallback mock data if API fails
            setData([
                { name: 'July', students: 85, teachers: 90 },
                { name: 'Aug', students: 82, teachers: 88 },
                { name: 'Sep', students: 88, teachers: 92 },
                { name: 'Oct', students: 78, teachers: 85 },
                { name: 'Nov', students: 84, teachers: 89 },
                { name: 'Dec', students: 86, teachers: 91 },
            ]);
        }
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
                <defs>
                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorTeachers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                    itemStyle={{ color: '#F3F4F6' }}
                />
                <Area type="monotone" dataKey="students" stroke="#3B82F6" fillOpacity={1} fill="url(#colorStudents)" name="Student %" />
                <Area type="monotone" dataKey="teachers" stroke="#10B981" fillOpacity={1} fill="url(#colorTeachers)" name="Teacher %" />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default MonthlyTrendChart;
