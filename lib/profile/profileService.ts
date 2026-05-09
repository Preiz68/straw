import { db } from "@/lib/firebase/client";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export interface DeveloperProfile {
  uid: string;
  role: string;
  rank: string;
  yearsOfExperience: number;
  preferredStack: string[];
  githubUsername: string;
  onboardingStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  currentStep: number;
  aiSummary?: string;
  aiTags?: string[];
  parsedResume?: any;
  selectedProjectNames?: string[];
  createdAt: any;
  updatedAt: any;
}

export const profileService = {
  async getProfile(uid: string): Promise<DeveloperProfile | null> {
    const docRef = doc(db, "profiles", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as DeveloperProfile;
    }
    return null;
  },

  async createProfile(uid: string, initialData: Partial<DeveloperProfile> = {}): Promise<void> {
    const docRef = doc(db, "profiles", uid);
    const profile: DeveloperProfile = {
      uid,
      role: initialData.role || "",
      rank: initialData.rank || "",
      yearsOfExperience: initialData.yearsOfExperience || 0,
      preferredStack: initialData.preferredStack || [],
      githubUsername: initialData.githubUsername || "",
      onboardingStatus: "NOT_STARTED",
      currentStep: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...initialData,
    };
    await setDoc(docRef, profile);
  },

  async updateProfile(uid: string, updates: Partial<DeveloperProfile>): Promise<void> {
    const docRef = doc(db, "profiles", uid);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  async completeOnboarding(uid: string): Promise<void> {
    await this.updateProfile(uid, {
      onboardingStatus: "COMPLETED",
    });
  }
};
