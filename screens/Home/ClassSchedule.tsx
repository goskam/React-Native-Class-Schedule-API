import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  View,
  Text,
  FlatList,
  ListRenderItem,
} from "react-native";
import moment from "moment";
import Swiper from "react-native-swiper";
import ClassScheduleCard from "../../components/ClassScheduleCard";
import { useClasses } from "../../hooks/useClasses";
import { ClassDetails } from "../../types/class";

const { width } = Dimensions.get("window");



export default function ClassSchedule() {
  const swiper = useRef<Swiper | null>(null);
  const [value, setValue] = useState(new Date());
  const [week, setWeek] = useState(0);
  const [filteredClasses, setFilteredClasses] = useState<ClassDetails[]>([]);

  const fetchedClasses = useClasses();


  const weeks = React.useMemo(() => {
    const start = moment().add(week, "weeks").startOf("week");

    return [-1, 0, 1].map((adj) => {
      return Array.from({ length: 7 }).map((_, index) => {
        const date = moment(start).add(adj, "week").add(index, "day");

        return {
          weekday: date.format("ddd"),
          date: date.toDate(),
        };
      });
    });
  }, [week]);

  useEffect(() => {
    const selectedDate = moment(value).format("YYYY-MM-DD");
    const filtered = fetchedClasses.filter(
      (cls) => moment(cls.date).format("YYYY-MM-DD") === selectedDate
    );
    setFilteredClasses(filtered);
  }, [value, fetchedClasses]);

  const renderClasses: ListRenderItem<ClassDetails> = (itemData) => {
    return (
      <ClassScheduleCard {...itemData.item} />
    );
  };

  //sorting classes by start time
  const sortedClasses = filteredClasses.sort((a, b) => {
    const parseTime = (time: string) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes; // Convert hours and minutes to total minutes
    };

    return parseTime(a.startTime) - parseTime(b.startTime); // Sort by total minutes
  });

  return (
    <View style={styles.container}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Class Schedule</Text>
      </View>

        <View style={styles.picker}>
          <Swiper
            index={1}
            ref={swiper}
            loop={false}
            showsPagination={false}
            onIndexChanged={(ind) => {
              if (ind === 1) {
                return;
              }
              setTimeout(() => {
                const newIndex = ind - 1;
                const newWeek = week + newIndex;
                setWeek(newWeek);
                setValue(moment(value).add(newIndex, "week").toDate());
                swiper.current?.scrollTo(1, false);
              }, 100);
            }}
          >
            {weeks.map((dates, index) => (
              <View style={styles.itemRow} key={index}>
                {dates.map((item, dateIndex) => {
                  const isActive =
                    value.toDateString() === item.date.toDateString();
                  return (
                    <TouchableWithoutFeedback
                      key={dateIndex}
                      onPress={() => {
                        setValue(item.date);

                        const selectedDate = moment(item.date).format(
                          "YYYY-MM-DD"
                        );
                        console.log("Selected date:", selectedDate); // This will log the correct date
                      }}
                    >
                      <View
                        style={[
                          styles.item,
                          isActive && {
                            backgroundColor: "#000000",
                            borderColor: "#000000",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.itemWeekday,
                            isActive && { color: "#ffffff" },
                          ]}
                        >
                          {item.weekday}
                        </Text>
                        <Text
                          style={[
                            styles.itemDate,
                            isActive && { color: "#ffffff" },
                          ]}
                        >
                          {item.date.getDate()}
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>
                  );
                })}
              </View>
            ))}
          </Swiper>
        </View>

      <View style={styles.content}>
        <View style={styles.cardWrapper}>
          <Text style={styles.subtitle}>{value.toDateString()}</Text>
          {sortedClasses.length > 0 ? (
            <FlatList
              data={sortedClasses}
              renderItem={renderClasses}
              keyExtractor={(item) => item.id}
            />
          ) : (
            <View style={styles.textContainer}>
              <Text style={styles.text}>
                No classes available for this day.
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 60,
  },
  sectionTitleContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000000",
  },
  picker: {
    maxHeight: 74,
    flexDirection: "row",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  cardWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 12,
    fontWeight: "500",
  },
  item: {
    flex: 1,
    height: 55,
    marginHorizontal: 4,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#e0e0e0",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  itemRow: {
    width: width,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  itemWeekday: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666666",
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },
  text: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
  textContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
});
