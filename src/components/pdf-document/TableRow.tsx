import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { Fragment } from "react";
import { ReportStats } from "../../types/types";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "black"
  },
  inference: {
    width: "60%",
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 30,
    marginTop: 10,
    marginBottom: 10,
    fontFamily: "Helvetica"
  },
  angle: {
    width: "40%",
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 30,
    marginTop: 10,
    marginBottom: 10,
    fontFamily: "Helvetica"
  },
});

type Props = {
    items: ReportStats[]
}

const TableRow = ({ items }: Props) => {
  const rows = items.map((item, i) => (
    <View style={styles.row} key={i}>
      <Text style={styles.inference}>{item.inference}</Text>
      <Text style={styles.angle}>{item.angle}</Text>
    </View>
  ));
  return <Fragment>{rows}</Fragment>;
};

export default TableRow;