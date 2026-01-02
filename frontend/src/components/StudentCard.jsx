import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { FaCheck, FaTimes } from 'react-icons/fa';

const StudentCard = ({ student, onMark, index }) => {
    const cardRef = useRef(null);

    // GSAP Stagger Animation
    useEffect(() => {
        gsap.fromTo(cardRef.current, 
            { opacity: 0, x: -30 }, 
            { opacity: 1, x: 0, duration: 0.5, delay: index * 0.1 }
        );
    }, [index]);

    // Click Animation
    const handleAction = (status) => {
        gsap.to(cardRef.current, { scale: 0.95, yoyo: true, repeat: 1, duration: 0.1 });
        onMark(student._id, status);
    };

    // Style Logic
    const getStyles = () => {
        if (student.status === 'Present') return 'border-l-4 border-green-500 bg-green-50';
        if (student.status === 'Absent') return 'border-l-4 border-red-500 bg-red-50';
        return 'border-l-4 border-gray-300 bg-white';
    };

    return (
        <div ref={cardRef} className={`flex justify-between items-center p-4 mb-3 shadow rounded-lg bg-white transition-colors ${getStyles()}`}>
            <div>
                <h3 className="font-bold text-gray-800">{student.name}</h3>
                <p className="text-xs text-gray-500">Roll: {student.rollNumber}</p>
            </div>
            <div className="flex gap-2">
                <button onClick={() => handleAction('Absent')} className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200">
                    <FaTimes />
                </button>
                <button onClick={() => handleAction('Present')} className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200">
                    <FaCheck />
                </button>
            </div>
        </div>
    );
};

export default StudentCard;