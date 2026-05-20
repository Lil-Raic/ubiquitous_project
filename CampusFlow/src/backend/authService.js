import { auth,db } from './firebaseConfig';
import { createUserWithEmailAndPassword as createUserEP } from 'firebase/auth';
import { doc,setDoc } from 'firebase/firestore';

const signUpUser = async (email, password, fullName) => {
    try {
        const userCredential = await createUserEP(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            name: fullName,
            role: 'student',
            createdAt: new Date()
        });

        console.log('User successfully registered!', user.email);
        return user;
    } catch (error) {
        console.error("Error signing up:", error.message);
        throw error;
    }
};

module.exports = {signUpUser};