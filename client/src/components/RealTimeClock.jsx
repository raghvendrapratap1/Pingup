import React, { useState, useEffect } from 'react';
import moment from 'moment';

const RealTimeClock = ({ className = '' }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000); // Update every second
        
        return () => clearInterval(interval);
    }, []);

    const formatTime = (date) => {
        return moment(date).format('HH:mm:ss');
    };

    const formatDate = (date) => {
        return moment(date).format('DD MMM YYYY');
    };

    return (
        <div className={`text-center ${className}`}>
            <div className="text-lg font-semibold text-gray-800">
                {formatTime(currentTime)}
            </div>
            <div className="text-xs text-gray-500">
                {formatDate(currentTime)}
            </div>
        </div>
    );
};

export default RealTimeClock;
