import React from 'react';

function UploadedResultsTable({ results }) {
    return (
        <div className="glass-card rounded-3xl p-6">
            <h4 className="text-xl font-semibold mb-6 text-slate-800 dark:text-slate-100">Uploaded Results</h4>
            {results && results.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="p-3 text-sm font-bold text-slate-500 dark:text-slate-400">Patient</th>
                                <th className="p-3 text-sm font-bold text-slate-500 dark:text-slate-400">Test Name</th>
                                <th className="p-3 text-sm font-bold text-slate-500 dark:text-slate-400">Uploaded Time</th>
                                <th className="p-3 text-sm font-bold text-slate-500 dark:text-slate-400">File Download</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((result, idx) => (
                                <tr key={result.id || idx} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="p-3 text-sm font-medium text-slate-800 dark:text-slate-200">{result.patient_name}</td>
                                    <td className="p-3 text-sm text-slate-800 dark:text-slate-200">{result.test_name}</td>
                                    <td className="p-3 text-sm text-slate-800 dark:text-slate-200">
                                        {result.uploaded_at ? new Date(result.uploaded_at).toLocaleString() : 'Just now'}
                                    </td>
                                    <td className="p-3">
                                        {result.file_url ? (
                                            <a
                                                href={result.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium text-xs rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-sm">download</span>
                                                Download
                                            </a>
                                        ) : (
                                            <span className="px-3 py-1.5 bg-slate-50 text-slate-400 dark:bg-slate-800/50 dark:text-slate-600 font-medium text-xs rounded-lg inline-flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">attach_file_off</span>
                                                No file
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-6">
                    <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600 mb-2">description</span>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No results uploaded yet</p>
                </div>
            )}
        </div>
    );
}

export default UploadedResultsTable;
