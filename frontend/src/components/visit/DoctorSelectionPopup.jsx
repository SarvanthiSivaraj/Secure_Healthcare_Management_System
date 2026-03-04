import React, { useState, useMemo } from 'react';

const DoctorSelectionPopup = ({ doctors, onClose, onSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedDoctorId, setSelectedDoctorId] = useState(null);

    // Extract unique categories (specializations) from doctors list
    const categories = useMemo(() => {
        const specializations = doctors.map(d => d.specialization?.trim() || 'General');
        const uniqueCategories = ['All', ...new Set(specializations)].filter(Boolean);
        return uniqueCategories;
    }, [doctors]);

    // Filter doctors based on search and category
    const filteredDoctors = useMemo(() => {
        return doctors.filter(doctor => {
            const matchesCategory = selectedCategory === 'All' || (doctor.specialization?.trim() || 'General') === selectedCategory;
            const searchTerm = searchQuery.toLowerCase();
            const fullName = `Dr. ${doctor.firstName} ${doctor.lastName}`.toLowerCase();
            const spec = (doctor.specialization || 'General').toLowerCase();

            const matchesSearch = fullName.includes(searchTerm) || spec.includes(searchTerm);
            return matchesCategory && matchesSearch;
        });
    }, [doctors, selectedCategory, searchQuery]);

    const handleContinue = () => {
        const doc = doctors.find(d => d.id === selectedDoctorId);
        if (doc) onSelect(doc);
    };

    return (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-4 bg-slate-200/40 dark:bg-slate-950/40 backdrop-blur-md">
            <div className="relative z-10 w-full max-w-md h-[90vh] bg-white/80 dark:bg-slate-800/70 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)] rounded-[2.5rem] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="pt-3 pb-4 px-6 flex flex-col items-center">
                    <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mb-6"></div>
                    <div className="w-full flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Select Doctor</h1>
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto px-6 pb-24 style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}">
                    {/* Categories Filter */}
                    <div className="flex gap-3 overflow-x-auto mb-6 -mx-6 px-6 style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${selectedCategory === cat
                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                                        : 'bg-white/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            className="w-full h-14 pl-12 pr-4 bg-white/40 dark:bg-slate-800/50 border border-white/50 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none transition-all shadow-sm"
                            placeholder="Search doctor or category"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Doctors Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {filteredDoctors.length === 0 ? (
                            <div className="col-span-2 text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                                No doctors found matching your criteria.
                            </div>
                        ) : (
                            filteredDoctors.map(doctor => {
                                const isSelected = selectedDoctorId === doctor.id;
                                return (
                                    <div
                                        key={doctor.id}
                                        onClick={() => setSelectedDoctorId(doctor.id)}
                                        className={`group relative p-4 rounded-3xl flex flex-col items-center text-center transition-all duration-300 cursor-pointer ${isSelected
                                                ? 'bg-emerald-50 dark:bg-emerald-400/20 border-2 border-emerald-400 shadow-md'
                                                : 'bg-white/60 dark:bg-slate-800/40 border border-white/50 dark:border-slate-700 hover:bg-white/80 dark:hover:bg-slate-800/60 hover:shadow-sm'
                                            }`}
                                    >
                                        <div className={`relative w-28 h-28 mb-4 rounded-2xl flex items-center justify-center overflow-hidden transition-all ${isSelected ? 'bg-white/60 dark:bg-slate-800' : 'bg-slate-100 dark:bg-slate-700'
                                            }`}>
                                            {/* We use an icon as generic fallback if no profile picture is provided by API */}
                                            {doctor.profileImage ? (
                                                <img alt={`Dr. ${doctor.firstName} ${doctor.lastName}`} className="w-full h-full object-cover" src={doctor.profileImage} />
                                            ) : (
                                                <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">medical_services</span>
                                            )}

                                            {isSelected && (
                                                <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center shadow-sm">
                                                    <span className="material-symbols-outlined text-white text-[16px]">check</span>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-slate-800 dark:text-white leading-tight text-sm">Dr. {doctor.firstName} {doctor.lastName}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 capitalize">{doctor.specialization || 'General'}</p>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Sticky Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-white/20 dark:border-slate-700/30">
                    <button
                        onClick={handleContinue}
                        disabled={!selectedDoctorId}
                        className="w-full bg-emerald-400 hover:bg-emerald-500 disabled:bg-slate-300 disabled:dark:bg-slate-700 text-slate-900 disabled:text-slate-500 font-bold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-400/20 disabled:shadow-none"
                    >
                        Continue with Selection
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DoctorSelectionPopup;
