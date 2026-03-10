const axios = require('axios');
const { Pool } = require('pg');
const config = require('../config/env');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
});

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

exports.startSession = async (req, res) => {
    try {
        const patient_id = req.user.id; // from auth middleware

        // 1. Create a DB session record to get an ID
        const result = await pool.query(
            `INSERT INTO triage_sessions (patient_id, status) VALUES ($1, 'in_progress') RETURNING id`,
            [patient_id]
        );
        const session_id = result.rows[0].id;

        // 2. Call AI service to start new session memory
        await axios.post(`${AI_SERVICE_URL}/chatbot/start`, { session_id });

        // 3. Log audit event
        await pool.query(
            `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, purpose, ip_address, status_code) 
             VALUES ($1, 'CHATBOT_TRIAGE_STARTED', 'triage_session', $2, 'PRE_SCREENING', $3, 200)`,
            [patient_id, session_id, req.ip]
        );

        res.status(200).json({ session_id, message: "Chatbot session started." });
    } catch (error) {
        console.error("Error starting chatbot session:", error);
        res.status(500).json({ message: "Failed to start session. AI Service might be unavailable." });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { session_id, message } = req.body;
        const patient_id = req.user.id;

        // Call Python AI service
        const aiResponse = await axios.post(`${AI_SERVICE_URL}/chatbot/message`, {
            session_id,
            message
        });

        // Append to local DB conversation log
        const aiReply = aiResponse.data.reply;

        const currentConv = await pool.query(`SELECT conversation FROM triage_sessions WHERE id = $1`, [session_id]);
        let convo = currentConv.rows[0].conversation || [];
        convo.push({ role: 'patient', text: message });
        convo.push({ role: 'bot', text: aiReply });

        await pool.query(
            `UPDATE triage_sessions SET conversation = $1::jsonb WHERE id = $2`,
            [JSON.stringify(convo), session_id]
        );

        // Optional: Trigger emergency if reply indicates it
        // Depending on your requirements, if aiReply includes "Emergency" you could flag priority.

        res.status(200).json({ reply: aiReply });
    } catch (error) {
        console.error("Error sending message to chatbot:", error);
        res.status(500).json({ reply: "I'm having trouble connecting to my medical reasoning engine right now. Please try again." });
    }
};

exports.analyzeSession = async (req, res) => {
    try {
        const { session_id } = req.body;
        const patient_id = req.user.id;

        // Call Python AI service to get the SOAP summary
        const aiResponse = await axios.get(`${AI_SERVICE_URL}/chatbot/summary/${session_id}`);
        const summary = aiResponse.data.summary;

        // Ensure confidence score fallback logic applies safely
        const dept = summary.recommended_department;
        const score = summary.confidence_score;
        let priority = 'normal';
        if (score < 0.6 || String(dept).toLowerCase() === 'general physician') {
            priority = 'low'; // Or fallback
        }

        // Save back to DB
        await pool.query(
            `UPDATE triage_sessions SET 
                soap_summary = $1::jsonb, 
                recommended_department = $2, 
                confidence_score = $3, 
                status = 'completed',
                priority = $4
             WHERE id = $5`,
            [JSON.stringify(summary), dept, score, priority, session_id]
        );

        // Log audit event for completion
        await pool.query(
            `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, purpose, ip_address, status_code) 
             VALUES ($1, 'CHATBOT_TRIAGE_COMPLETED', 'triage_session', $2, 'PRE_SCREENING', $3, 200)`,
            [patient_id, session_id, req.ip]
        );

        res.status(200).json({ summary });
    } catch (error) {
        console.error("Error analyzing session:", error);
        res.status(500).json({ message: "Failed to generate summary." });
    }
};

exports.getSummary = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT * FROM triage_sessions WHERE id = $1`,
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Session not found." });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error retrieving summary:", error);
        res.status(500).json({ message: "Failed to retrieve summary." });
    }
};
