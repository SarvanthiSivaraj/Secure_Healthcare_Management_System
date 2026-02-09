
import React, { useState, useEffect } from 'react';
import { visitApi } from '../../api/visitApi'; // Ensure correct import path
import { userApi } from '../../api/userApi'; // Ensure correct import path
import './ManageVisits.css';

const ManageVisits = () => {
    const [visits, setVisits] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [nurses, setNurses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Selection state for each visit
    const [assignments, setAssignments] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [visitsData, doctorsData, nursesData] = await Promise.all([
                visitApi.getHospitalVisits('pending'),
                userApi.getDoctors(),
                userApi.getNurses()
            ]);

            setVisits(visitsData.data || []);
            setDoctors(doctorsData.data || []);
            setNurses(nursesData.data || []);

        } catch (err) {
            setError('Failed to load data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignmentChange = (visitId, field, value) => {
        setAssignments(prev => ({
            ...prev,
            [visitId]: {
                ...prev[visitId],
                [field]: value
            }
        }));
    };

    const handleAssign = async (visitId) => {
        const assignment = assignments[visitId];
        if (!assignment?.doctorId) {
            alert('Please select a doctor');
            return;
        }

        try {
            const result = await visitApi.approveVisit(
                visitId,
                assignment.doctorId,
                assignment.nurseId || null
            );

            // Display OTP prominently
            const otpCode = result.data.otp;
            alert(`Visit approved!\n\nOTP for patient: ${otpCode}\n\nPlease communicate this OTP to the patient for verification.`);

            setSuccessMessage(`Visit approved! OTP: ${otpCode}`);

            // Refresh the list
            fetchData();

            setTimeout(() => setSuccessMessage(null), 10000);
        } catch (err) {
            alert('Failed to approve visit: ' + (err.response?.data?.message || err.message));
            console.error(err);
        }
    };

    if (loading) return <div className="loading">Loading visits...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="manage-visits-container">
            <h2>Manage Pending Visits</h2>

            {successMessage && <div className="success-message">{successMessage}</div>}

            {visits.length === 0 ? (
                <p className="no-visits">No pending visit requests.</p>
            ) : (
                <div className="visits-table-container">
                    <table className="visits-table">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Reason</th>
                                <th>Symptoms</th>
                                <th>Time</th>
                                <th>Assign Doctor</th>
                                <th>Assign Nurse</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visits.map(visit => (
                                <tr key={visit.id}>
                                    <td>
                                        <div className="patient-name">{visit.patient_first_name} {visit.patient_last_name}</div>
                                        <div className="patient-email">{visit.patient_email}</div>
                                    </td>
                                    <td>{visit.reason}</td>
                                    <td>{visit.symptoms || '-'}</td>
                                    <td>{new Date(visit.created_at).toLocaleString()}</td>
                                    <td>
                                        <select
                                            value={assignments[visit.id]?.doctorId || ''}
                                            onChange={(e) => handleAssignmentChange(visit.id, 'doctorId', e.target.value)}
                                            className="staff-select"
                                        >
                                            <option value="">Select Doctor</option>
                                            {doctors.map(doc => (
                                                <option key={doc.id} value={doc.id}>
                                                    Dr. {doc.first_name} {doc.last_name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <select
                                            value={assignments[visit.id]?.nurseId || ''}
                                            onChange={(e) => handleAssignmentChange(visit.id, 'nurseId', e.target.value)}
                                            className="staff-select"
                                        >
                                            <option value="">Select Nurse</option>
                                            {nurses.map(nurse => (
                                                <option key={nurse.id} value={nurse.id}>
                                                    {nurse.first_name} {nurse.last_name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <button
                                            className="assign-btn"
                                            onClick={() => handleAssign(visit.id)}
                                        >
                                            Approve & Get OTP
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ManageVisits;
