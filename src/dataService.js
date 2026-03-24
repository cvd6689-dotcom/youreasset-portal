import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const BRAND_DOC = doc(db, "site", "brand");
const INSURERS_DOC = doc(db, "site", "insurers");

export async function initializeSiteData(defaultBrand, defaultInsurers) {
  const brandSnap = await getDoc(BRAND_DOC);
  const insurersSnap = await getDoc(INSURERS_DOC);

  if (!brandSnap.exists()) {
    await setDoc(BRAND_DOC, defaultBrand);
  }

  if (!insurersSnap.exists()) {
    await setDoc(INSURERS_DOC, { items: defaultInsurers });
  }
}

export function subscribeBrand(callback) {
  return onSnapshot(BRAND_DOC, (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    }
  });
}

export function subscribeInsurers(callback) {
  return onSnapshot(INSURERS_DOC, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback(Array.isArray(data.items) ? data.items : []);
    }
  });
}

export async function saveBrand(brand) {
  await setDoc(BRAND_DOC, brand);
}

export async function saveInsurers(insurers) {
  await setDoc(INSURERS_DOC, { items: insurers });
}
