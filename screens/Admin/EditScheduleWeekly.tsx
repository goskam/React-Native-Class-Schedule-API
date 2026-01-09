import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import moment, { Moment } from "moment";
import { addClass, fetchClasses, updateClass, deleteClass } from "../../util/http";
import { ClassDetails } from "../../types/class";

// Form data type for class input
type ClassFormData = {
  className: string;
  instructor: string;
  startTime: string;
  endTime: string;
  description: string;
};

const EditScheduleWeekly: React.FC = () => {
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [classes, setClasses] = useState<ClassDetails[]>([]);
  const [selectedDate, setSelectedDate] = useState<Moment | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [formData, setFormData] = useState<ClassFormData>({
    className: "",
    instructor: "",
    startTime: "",
    endTime: "",
    description: "",
  });
  const [selectedClass, setSelectedClass] = useState<ClassDetails | null>(null);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);

  const fetchAndSetClasses = async (): Promise<void> => {
    try {
      const allClasses = await fetchClasses();
      setClasses(allClasses);
    } catch (err) {
      Alert.alert("Error", "Failed to fetch classes.");
    }
  };

  useEffect(() => {
    fetchAndSetClasses();
  }, [weekOffset]);

  const startOfWeek: Moment = moment().add(weekOffset, "weeks").startOf("week");

  const weekDates: Moment[] = Array.from({ length: 7 }).map((_, index) =>
    moment(startOfWeek).add(index, "days")
  );

  const classesForDate = (dateStr: string): ClassDetails[] =>
    classes.filter((cls) => cls.date === dateStr);

  // Open Add Class modal for a specific date
  const openModal = (date: Moment): void => {
    setSelectedDate(date);
    setFormData({
      className: "",
      instructor: "",
      startTime: "",
      endTime: "",
      description: "",
    });
    setModalVisible(true);
  };

  // Open Edit Class modal with prefilled data
  const openEditModal = (cls: ClassDetails): void => {
    setSelectedClass(cls);
    setFormData({
      className: cls.className,
      instructor: cls.instructor,
      startTime: cls.startTime,
      endTime: cls.endTime,
      description: cls.description,
    });
    setEditModalVisible(true);
  };

  const handleChange = (name: keyof ClassFormData, value: string): void => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add new class submit
  const handleSubmit = async (): Promise<void> => {
    if (!selectedDate) {
      Alert.alert("Error", "Please select a date.");
      return;
    }

    const classData: Omit<ClassDetails, "id"> = {
      ...formData,
      date: selectedDate.format("YYYY-MM-DD"),
    };

    try {
      await addClass(classData);
      Alert.alert("Success", "Class added successfully!");
      setFormData({
        className: "",
        instructor: "",
        startTime: "",
        endTime: "",
        description: "",
      });
      setModalVisible(false);
      fetchAndSetClasses();
    } catch (err) {
      Alert.alert("Error", "Failed to add class.");
    }
  };

  // Edit existing class submit (update)
  const handleEditSubmit = async (): Promise<void> => {
    if (!selectedClass) {
      Alert.alert("Error", "No class selected.");
      return;
    }

    try {
      await updateClass(selectedClass.id, {
        ...formData,
        date: selectedClass.date,
      });
      Alert.alert("Success", "Class updated successfully!");
      setEditModalVisible(false);
      setSelectedClass(null);
      fetchAndSetClasses();
    } catch (err) {
      Alert.alert("Error", "Failed to update class.");
    }
  };

  // Delete selected class
  const handleDelete = async (): Promise<void> => {
    if (!selectedClass) {
      Alert.alert("Error", "No class selected.");
      return;
    }

    Alert.alert(
      "Delete Confirmation",
      `Are you sure you want to delete "${selectedClass.className}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteClass(selectedClass.id);
              Alert.alert("Deleted", "Class deleted successfully.");
              setEditModalVisible(false);
              setSelectedClass(null);
              fetchAndSetClasses();
            } catch (err) {
              Alert.alert("Error", "Failed to delete class.");
            }
          },
        },
      ]
    );
  };

  const goToPreviousWeek = (): void => setWeekOffset((prev) => prev - 1);
  const goToNextWeek = (): void => setWeekOffset((prev) => prev + 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousWeek} style={styles.navButton}>
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.weekLabel}>
          Week of {startOfWeek.format("MMM D")}
        </Text>
        <TouchableOpacity onPress={goToNextWeek} style={styles.navButton}>
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal>
        <View style={styles.table}>
          <View style={styles.row}>
            {weekDates.map((date) => (
              <View key={date.toString()} style={styles.headerCell}>
                <Text style={styles.headerText}>{date.format("ddd")}</Text>
                <Text style={styles.dateText}>{date.format("MMM D")}</Text>
              </View>
            ))}
          </View>

          <View style={styles.row}>
            {weekDates.map((date) => (
              <View key={date.toString()} style={styles.cell}>
                {classesForDate(date.format("YYYY-MM-DD"))
                  .sort((a, b) => {
                    const toMinutes = (timeStr: string): number => {
                      const [h, m] = timeStr.split(":").map(Number);
                      return h * 60 + m;
                    };
                    return toMinutes(a.startTime) - toMinutes(b.startTime);
                  })
                  .map((cls) => (
                    <TouchableOpacity
                      key={cls.id}
                      style={styles.classCard}
                      onPress={() => openEditModal(cls)}
                    >
                      <Text style={styles.classTitle}>{cls.className}</Text>
                      <Text style={styles.classTime}>
                        {cls.startTime} - {cls.endTime}
                      </Text>
                      <Text style={styles.classInstructor}>{cls.instructor}</Text>
                    </TouchableOpacity>
                  ))}

                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => openModal(date)}
                >
                  <Text style={styles.addButtonText}>＋</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Add Class Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Add Class for {selectedDate?.format("dddd, MMM D")}
            </Text>
            <TextInput
              placeholder="Class Name"
              value={formData.className}
              onChangeText={(text) => handleChange("className", text)}
              style={styles.input}
            />
            <TextInput
              placeholder="Instructor"
              value={formData.instructor}
              onChangeText={(text) => handleChange("instructor", text)}
              style={styles.input}
            />
            <TextInput
              placeholder="Start Time (e.g. 10:00)"
              value={formData.startTime}
              onChangeText={(text) => handleChange("startTime", text)}
              style={styles.input}
            />
            <TextInput
              placeholder="End Time (e.g. 11:00)"
              value={formData.endTime}
              onChangeText={(text) => handleChange("endTime", text)}
              style={styles.input}
            />
            <TextInput
              placeholder="Description"
              value={formData.description}
              onChangeText={(text) => handleChange("description", text)}
              multiline
              style={[styles.input, { height: 60 }]}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSubmit} style={styles.saveButton}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Class Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Edit Class for {selectedClass?.date
                ? moment(selectedClass.date).format("dddd, MMM D")
                : ""}
            </Text>
            <TextInput
              placeholder="Class Name"
              value={formData.className}
              onChangeText={(text) => handleChange("className", text)}
              style={styles.input}
            />
            <TextInput
              placeholder="Instructor"
              value={formData.instructor}
              onChangeText={(text) => handleChange("instructor", text)}
              style={styles.input}
            />
            <TextInput
              placeholder="Start Time (e.g. 10:00)"
              value={formData.startTime}
              onChangeText={(text) => handleChange("startTime", text)}
              style={styles.input}
            />
            <TextInput
              placeholder="End Time (e.g. 11:00)"
              value={formData.endTime}
              onChangeText={(text) => handleChange("endTime", text)}
              style={styles.input}
            />
            <TextInput
              placeholder="Description"
              value={formData.description}
              onChangeText={(text) => handleChange("description", text)}
              multiline
              style={[styles.input, { height: 60 }]}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => {
                  setEditModalVisible(false);
                  setSelectedClass(null);
                }}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEditSubmit} style={styles.saveButton}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EditScheduleWeekly;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 10,
  },
  navButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#eee",
  },
  navButtonText: {
    fontSize: 20,
  },
  weekLabel: {
    fontSize: 18,
    fontWeight: "600",
  },
  table: {
    flexDirection: "column",
  },
  row: {
    flexDirection: "row",
  },
  headerCell: {
    width: 100,
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  dateText: {
    fontSize: 14,
    color: "#555",
  },
  cell: {
    width: 100,
    minHeight: 150,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  classCard: {
    backgroundColor: "#000000",
    padding: 8,
    marginBottom: 6,
    borderRadius: 6,
  },
  classTitle: {
    fontWeight: "600",
    fontSize: 14,
    color: "#ffffff",
  },
  classTime: {
    fontSize: 12,
    color: "#ffffff",
    opacity: 0.9,
  },
  classInstructor: {
    fontSize: 12,
    color: "#ffffff",
    opacity: 0.8,
  },
  addButton: {
    alignSelf: "center",
    padding: 6,
    backgroundColor: "#ddd",
    borderRadius: 10,
    marginTop: 5,
  },
  addButtonText: {
    fontSize: 20,
    color: "#444",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000099",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  cancelButton: {
    padding: 10,
  },
  cancelText: {
    color: "#888",
  },
  saveButton: {
    backgroundColor: "#111",
    padding: 10,
    borderRadius: 6,
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#cc3333",
    padding: 10,
    borderRadius: 6,
  },
  deleteText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
