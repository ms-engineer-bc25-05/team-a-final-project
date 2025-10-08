import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function testGetSurveys() {
    const querySnapshot = await getDocs(collection(db, "surveys"));
    const surveys = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
    console.log("Firestore surveys:",surveys);
    return surveys;
    
}