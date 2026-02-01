import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import { doc, setDoc, getDoc, collection, addDoc } from "firebase/firestore";

export default function Diagnostics() {
    const { currentUser } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    const log = (msg, type = "info") => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { msg, type, timestamp }]);
    };

    const runTests = async () => {
        setLogs([]);
        setLoading(true);
        log("Starting Diagnostics...", "info");

        // 1. Auth Check
        if (!currentUser) {
            log("CRITICAL: No User Logged In", "error");
            setLoading(false);
            return;
        }
        log(`User Logged In: ${currentUser.uid}`, "success");
        log(`Email: ${currentUser.email}`, "info");

        try {
            // 2. Write Test (User Doc)
            log("Attempting Write to /users/{uid}/diagnostics/test...", "info");
            const diagRef = doc(db, "users", currentUser.uid, "diagnostics", "test_run");
            await setDoc(diagRef, {
                lastRun: new Date().toISOString(),
                userAgent: navigator.userAgent
            });
            log("WRITE SUCCESS: /users/.../diagnostics/test_run", "success");

            // 3. Write Test (Habits)
            log("Attempting Write to /users/{uid}/habits (Subcollection)...", "info");
            const habitsRef = collection(db, "users", currentUser.uid, "habits");
            const habitDoc = await addDoc(habitsRef, {
                name: "Diagnostic Test Habit",
                category: "Test",
                createdAt: new Date().toISOString(),
                isDiagnostic: true
            });
            log(`WRITE SUCCESS: Created habit ${habitDoc.id}`, "success");

            // 4. Read Test
            log("Attempting Read...", "info");
            const readSnap = await getDoc(diagRef);
            if (readSnap.exists()) {
                log("READ SUCCESS: Verified data existence", "success");
            } else {
                log("READ FAILURE: Document not found after write", "error");
            }

        } catch (error) {
            console.error(error);
            log(`FAILURE: ${error.code} - ${error.message}`, "error");
            if (error.code === 'permission-denied') {
                log("DIAGNOSIS: Firestore Security Rules are blocking your device.", "error");
            } else if (error.code === 'unavailable') {
                log("DIAGNOSIS: Client is OFFLINE. Check Network/Firewall.", "error");
            }
        } finally {
            setLoading(false);
            log("Diagnostics Complete.", "info");
        }
    };

    return (
        <div className="min-h-screen bg-black text-green-400 font-mono p-8">
            <h1 className="text-2xl font-bold mb-4 text-white">System Diagnostics</h1>

            <div className="mb-6 p-4 border border-green-900 rounded bg-green-900/10">
                <p className="text-sm text-gray-400 mb-2">User ID:</p>
                <code className="text-white select-all">{currentUser?.uid || "Not Logged In"}</code>
            </div>

            <button
                onClick={runTests}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-black font-bold rounded hover:bg-green-500 disabled:opacity-50 mb-8"
            >
                {loading ? "Running Tests..." : "Run Connectivity Tests"}
            </button>

            <div className="space-y-2 font-sm">
                {logs.map((L, i) => (
                    <div key={i} className={`
                        ${L.type === 'error' ? 'text-red-500 font-bold' : ''}
                        ${L.type === 'success' ? 'text-green-300' : ''}
                        ${L.type === 'info' ? 'text-gray-400' : ''}
                    `}>
                        <span className="opacity-50">[{L.timestamp}]</span> {L.msg}
                    </div>
                ))}
            </div>
        </div>
    );
}
