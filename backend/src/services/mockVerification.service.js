/**
 * Mock Verification Service
 * Simulates verification against external government/medical databases
 */

// Mock Aadhaar Database
const mockAadhaarDB = {
    '123456789012': {
        name: 'Rahul Sharma',
        dob: '1990-05-15',
        gender: 'male',
        address: '123, Gandhi Road, Mumbai, Maharashtra',
        photoUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
        email: 'rahul.sharma@example.com',
        phone: '9876543210'
    },
    '987654321098': {
        name: 'Priya Patel',
        dob: '1985-08-22',
        gender: 'female',
        address: '456, Nehru Street, Ahmedabad, Gujarat',
        photoUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
        email: 'priya.patel@example.com',
        phone: '9876543211'
    },
    '112233445566': {
        name: 'Amit Kumar',
        dob: '1978-12-10',
        gender: 'male',
        address: '789, Bose Colony, Kolkata, West Bengal',
        photoUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
        email: 'amit.kumar@example.com',
        phone: '9876543212'
    },
    '676942067676': {
        name: 'Harish G M',
        dob: '2005-05-28',
        gender: 'male',
        address: 'your house',
        photoUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
        email: 'gmharish285@gmail.com',
        phone: '9080134035'
    },
    '739461347231': {
        name: 'Harshita',
        dob: '2000-01-01',
        gender: 'female',
        address: 'Amrita University, Coimbatore',
        photoUrl: 'https://randomuser.me/api/portraits/women/3.jpg',
        email: 'harshitaravi31@gmail.com',
        phone: '7364827354'
    }
};

// Mock Medical Council Database
const mockMedicalCouncilDB = {
    'REG12345': {
        name: 'Dr. Suresh Verma',
        status: 'active',
        regYear: 2010,
        council: 'Maharashtra Medical Council',
        qualification: 'MBBS, MD',
        photoUrl: 'https://randomuser.me/api/portraits/men/4.jpg',
        email: 'suresh.verma@example.com',
        phone: '9876543220'
    },
    'REG67890': {
        name: 'Dr. Anita Desai',
        status: 'active',
        regYear: 2015,
        council: 'Karnataka Medical Council',
        qualification: 'MBBS, MS',
        photoUrl: 'https://randomuser.me/api/portraits/women/5.jpg',
        email: 'anita.desai@example.com',
        phone: '9876543221'
    },
    'REG11111': {
        name: 'Dr. Rajesh Gupta',
        status: 'suspended',
        regYear: 2005,
        council: 'Delhi Medical Council',
        qualification: 'MBBS',
        photoUrl: 'https://randomuser.me/api/portraits/men/6.jpg',
        email: 'rajesh.gupta@example.com',
        phone: '9876543222'
    }
};

/**
 * Verify Aadhaar ID
 * @param {string} aadhaarId 
 * @param {string} email - Optional: Verify if matches record
 * @param {string} phone - Optional: Verify if matches record
 * @returns {Promise<Object>}
 */
const verifyAadhaar = async (aadhaarId, email, phone) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Strip spaces/dashes for validation
    const cleanId = String(aadhaarId).replace(/[\s-]/g, '');

    // Basic format validation: must be 12 digits
    if (!/^\d{12}$/.test(cleanId)) {
        throw new Error('Aadhaar ID must be a 12-digit number');
    }

    const data = mockAadhaarDB[cleanId];

    // If found in mock DB, do strict email/phone matching
    if (data) {
        if (email && data.email !== email) {
            throw new Error('Email does not match Aadhaar records');
        }
        if (phone && data.phone !== phone) {
            throw new Error('Phone number does not match Aadhaar records');
        }
        return { isValid: true, data };
    }

    // For any other valid 12-digit Aadhaar, return a generic success (mock verification passes)
    return {
        isValid: true,
        data: {
            name: 'Verified Citizen',
            dob: '2000-01-01',
            gender: 'unknown',
            address: 'Verified Address',
            email: email || '',
            phone: phone || ''
        }
    };
};

/**
 * Verify Doctor Registration Number
 * @param {string} regId 
 * @param {string} email - Optional: Verify if matches record
 * @param {string} phone - Optional: Verify if matches record
 * @returns {Promise<Object>}
 */
const verifyDoctorReg = async (regId, email, phone) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    let data = mockMedicalCouncilDB[regId];

    // Fallback for testing: if not found, create a fake successful response
    if (!data) {
        data = {
            name: 'Dr. Test User',
            status: 'active',
            regYear: new Date().getFullYear(),
            council: 'Mock State Medical Council',
            qualification: 'MBBS',
            photoUrl: 'https://randomuser.me/api/portraits/men/10.jpg',
            email: email,
            phone: phone
        };
    }

    if (data.status !== 'active') {
        throw new Error(`Doctor registration is ${data.status}`);
    }

    // Skip strict email/phone match for fallback generic data
    if (mockMedicalCouncilDB[regId]) {
        if (email && data.email !== email) {
            throw new Error('Email does not match Medical Council records');
        }

        if (phone && data.phone !== phone) {
            throw new Error('Phone number does not match Medical Council records');
        }
    }

    return {
        isValid: true,
        data
    };
};

module.exports = {
    verifyAadhaar,
    verifyDoctorReg
};
