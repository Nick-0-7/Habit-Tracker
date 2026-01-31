import { db } from "./firebase";
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    deleteField,
    deleteDoc,
    arrayUnion
} from "firebase/firestore";

/**
 * Get user profile data
 */
export async function getUserData(uid) {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        return null;
    }
}

/**
 * Create initial user document
 */
export async function createUserDoc(uid, email) {
    const docRef = doc(db, "users", uid);
    const initialData = {
        uid,
        email,
        badges: [],
        createdAt: new Date().toISOString()
    };

    await setDoc(docRef, initialData);
    return initialData;
}

/**
 * Add a new habit
 */
export async function addHabit(uid, name, category = "General", description = "") {
    const habitsRef = collection(db, "users", uid, "habits");
    await addDoc(habitsRef, {
        name,
        category,
        description,
        history: {},
        currentStreak: 0,
        createdAt: new Date().toISOString()
    });
}

/**
 * Real-time subscription to user's habits
 */
export function subscribeToHabits(uid, callback) {
    const habitsRef = collection(db, "users", uid, "habits");

    return onSnapshot(habitsRef, (snapshot) => {
        const habits = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        // Client-side sort
        habits.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        callback(habits);
    });
}

/**
 * Real-time subscription to user profile (for badges)
 */
export function subscribeToUser(uid, callback) {
    const docRef = doc(db, "users", uid);
    return onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            callback(doc.data());
        }
    });
}

/**
 * Toggle habit completion and update streak/badges
 */
export async function toggleHabit(uid, habitId, dateString, currentHistory) {
    const habitRef = doc(db, "users", uid, "habits", habitId);

    const isCompleted = !!currentHistory[dateString];
    const newStatus = !isCompleted;

    // 1. Update History
    let updatePayload = {};
    if (newStatus) {
        updatePayload[`history.${dateString}`] = true;
    } else {
        updatePayload[`history.${dateString}`] = deleteField();
    }

    // 2. Refresh Streak
    const newHistoryMap = { ...currentHistory };
    if (newStatus) {
        newHistoryMap[dateString] = true;
    } else {
        delete newHistoryMap[dateString];
    }

    const newStreak = calculateStreak(newHistoryMap);
    updatePayload.currentStreak = newStreak;

    await updateDoc(habitRef, updatePayload);

    // 3. Badges
    if (newStatus) {
        await checkAndUnlockBadges(uid, newStreak);
    }
}

async function checkAndUnlockBadges(uid, streak) {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    const userData = userSnap.data();
    const currentBadges = userData.badges || [];

    const milestones = [
        { id: '7-day', days: 7, label: "Week Warrior" },
        { id: '15-day', days: 15, label: "Consistency King" },
        { id: '30-day', days: 30, label: "Master of Discipline" }
    ];

    const newBadges = [];

    milestones.forEach(m => {
        if (streak >= m.days && !currentBadges.some(b => b.id === m.id)) {
            newBadges.push({
                id: m.id,
                label: m.label,
                unlockedAt: new Date().toISOString()
            });
        }
    });

    if (newBadges.length > 0) {
        await updateDoc(userRef, {
            badges: arrayUnion(...newBadges)
        });
    }
}

/**
 * Delete a habit document
 */
export async function deleteHabit(uid, habitId) {
    const habitRef = doc(db, "users", uid, "habits", habitId);
    await deleteDoc(habitRef);
}

export function calculateStreak(history) {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const dates = Object.keys(history).sort().reverse();

    if (dates.length === 0) return 0;

    let latest = dates[0];
    if (latest !== today && latest !== yesterday) return 0;

    let streak = 0;
    let expectedDate = new Date(latest);

    for (let i = 0; i < dates.length; i++) {
        if (new Date(dates[i]).toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
            streak++;
            expectedDate.setDate(expectedDate.getDate() - 1);
        } else break;
    }
    return streak;
}
