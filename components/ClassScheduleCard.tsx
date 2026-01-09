import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { ClassDetails } from "../types/class";

type ClassScheduleCardProps = ClassDetails;

const ClassScheduleCard = ({
  id,
  date,
  startTime,
  endTime,
  className,
  instructor,
  description,
}: ClassScheduleCardProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <Text style={styles.classText}>{className}</Text>
          <Text style={styles.timeText}>
            {startTime} - {endTime}
          </Text>
        </View>
        <Text style={styles.instructorText}>with {instructor}</Text>
        <View style={styles.divider} />
      </View>
    </View>
  );
};

export default ClassScheduleCard;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 5,
    marginBottom: 8,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  innerContainer: {
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  classText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    flex: 1,
  },
  timeText: {
    fontSize: 13,
    color: "#666666",
    marginLeft: 8,
  },
  instructorText: {
    fontSize: 13,
    color: "#666666",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginTop: 12,
    width: "100%",
  },
});