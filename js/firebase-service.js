// js/firebase-service.js
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { 
    getDatabase, 
    ref, 
    set, 
    get,
    query,
    orderByChild,
    limitToLast,
    push,
    update
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

class FirebaseService {
    constructor() {
        this.auth = getAuth();
        this.db = getDatabase();
        this.currentUser = null;
        
        // Listen for auth state changes
        onAuthStateChanged(this.auth, (user) => {
            this.currentUser = user;
            this.onAuthStateChanged(user);
        });
    }

    // Auth State Change Handler
    onAuthStateChanged(user) {
        const loginBtn = document.getElementById('login-btn');
        const userDisplay = document.getElementById('user-display');
        
        if (user) {
            console.log('User is signed in:', user.displayName);
            if (loginBtn) loginBtn.textContent = 'Sign Out';
            if (userDisplay) userDisplay.textContent = `Welcome, ${user.displayName}!`;
        } else {
            console.log('User is signed out');
            if (loginBtn) loginBtn.textContent = 'Sign In';
            if (userDisplay) userDisplay.textContent = '';
        }
    }

    // Authentication Methods
    async signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(this.auth, provider);
            return result.user;
        } catch (error) {
            console.error("Error signing in with Google:", error);
            throw error;
        }
    }

    async signOut() {
        try {
            await signOut(this.auth);
        } catch (error) {
            console.error("Error signing out:", error);
            throw error;
        }
    }

    // Score Management
    async saveScore(score, difficulty) {
        if (!this.currentUser) {
            console.log('No user signed in');
            return;
        }

        const scoreData = {
            userId: this.currentUser.uid,
            userName: this.currentUser.displayName,
            score: score,
            difficulty: difficulty,
            timestamp: Date.now()
        };

        try {
            const newScoreRef = push(ref(this.db, 'scores'));
            await set(newScoreRef, scoreData);
            await this.checkAndUpdateHighScores(scoreData);
        } catch (error) {
            console.error("Error saving score:", error);
            throw error;
        }
    }

    async checkAndUpdateHighScores(newScore) {
        try {
            const topScores = await this.getTopScores();
            if (topScores.length < 20 || newScore.score > topScores[topScores.length - 1].score) {
                const highScoreData = {
                    userId: newScore.userId,
                    userName: newScore.userName,
                    score: newScore.score,
                    timestamp: newScore.timestamp
                };
                await push(ref(this.db, 'highScores'), highScoreData);
            }
        } catch (error) {
            console.error("Error updating high scores:", error);
        }
    }

    async getTopScores(limit = 20) {
        try {
            const scoresRef = ref(this.db, 'highScores');
            const topScoresQuery = query(
                scoresRef,
                orderByChild('score'),
                limitToLast(limit)
            );
            
            const snapshot = await get(topScoresQuery);
            const scores = [];
            
            snapshot.forEach((childSnapshot) => {
                scores.push(childSnapshot.val());
            });
            
            return scores.reverse(); // Highest scores first
        } catch (error) {
            console.error("Error getting top scores:", error);
            throw error;
        }
    }

    // User Statistics
    async saveGameStats(stats) {
        if (!this.currentUser) return;

        const statsRef = ref(this.db, `userStats/${this.currentUser.uid}/games/${Date.now()}`);
        try {
            await set(statsRef, {
                ...stats,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error("Error saving game stats:", error);
            throw error;
        }
    }

    async getUserStats() {
        if (!this.currentUser) return null;

        try {
            const statsRef = ref(this.db, `userStats/${this.currentUser.uid}/games`);
            const snapshot = await get(statsRef);
            return snapshot.val();
        } catch (error) {
            console.error("Error getting user stats:", error);
            throw error;
        }
    }

    // Tag Management
    async createTag(tagName) {
        if (!this.currentUser) return;

        try {
            const tagRef = ref(this.db, `tags/${tagName.toLowerCase()}`);
            const snapshot = await get(tagRef);
            
            if (snapshot.exists()) {
                throw new Error('Tag already exists');
            }

            await set(tagRef, {
                createdBy: this.currentUser.uid,
                createdAt: Date.now()
            });
        } catch (error) {
            console.error("Error creating tag:", error);
            throw error;
        }
    }

    async joinTag(tagName) {
        if (!this.currentUser) return;

        try {
            await update(ref(this.db), {
                [`userTags/${this.currentUser.uid}/${tagName}`]: true,
                [`tagMembers/${tagName}/${this.currentUser.uid}`]: true
            });
        } catch (error) {
            console.error("Error joining tag:", error);
            throw error;
        }
    }

    async getTagScores(tagName, limit = 20) {
        try {
            const tagScoresRef = ref(this.db, `tagScores/${tagName}`);
            const topScoresQuery = query(
                tagScoresRef,
                orderByChild('score'),
                limitToLast(limit)
            );
            
            const snapshot = await get(topScoresQuery);
            const scores = [];
            
            snapshot.forEach((childSnapshot) => {
                scores.push(childSnapshot.val());
            });
            
            return scores.reverse();
        } catch (error) {
            console.error("Error getting tag scores:", error);
            throw error;
        }
    }

    async getUserTags() {
        if (!this.currentUser) return [];

        try {
            const userTagsRef = ref(this.db, `userTags/${this.currentUser.uid}`);
            const snapshot = await get(userTagsRef);
            return snapshot.val() ? Object.keys(snapshot.val()) : [];
        } catch (error) {
            console.error("Error getting user tags:", error);
            throw error;
        }
    }
}

// Create and export a single instance
export const firebaseService = new FirebaseService();