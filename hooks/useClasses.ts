import { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { ClassDetails } from "../types/class";


export function useClasses(): ClassDetails[] {
  const [fetchedClasses, setFetchedClasses] = useState<ClassDetails[]>([]);

  useEffect(() => {
    const db = getDatabase();
    const classesRef = ref(db, "/classes");

    const unsubscribe = onValue(classesRef, (snapshot) => {
      const data = snapshot.val() || {};

      // Estimate data size (in bytes)
      const jsonString = JSON.stringify(data);
      const byteLength = new TextEncoder().encode(jsonString).length;
      const kbSize = (byteLength / 1024).toFixed(2);

      console.log(`Data transferred -useClasses hook-: ${kbSize} KB`);

      const loadedClasses: ClassDetails[] = Object.keys(data).map((key) => ({
        id: key,
        date: data[key].date,
        startTime: data[key].startTime,
        endTime: data[key].endTime,
        className: data[key].className,
        instructor: data[key].instructor,
        description: data[key].description,
      }));

      setFetchedClasses(loadedClasses);
    });

    return () => unsubscribe(); // Clean up listener on unmount
  }, []);

  return fetchedClasses;
}
