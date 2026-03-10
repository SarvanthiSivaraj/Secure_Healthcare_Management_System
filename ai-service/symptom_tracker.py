symptom_sessions = {}

def update_symptoms(session_id, new_symptoms):
    if session_id not in symptom_sessions:
        symptom_sessions[session_id] = set()

    for symptom in new_symptoms:
        symptom_sessions[session_id].add(symptom)

    return list(symptom_sessions[session_id])

def get_symptoms(session_id):
    if session_id not in symptom_sessions:
        return []

    return list(symptom_sessions[session_id])
