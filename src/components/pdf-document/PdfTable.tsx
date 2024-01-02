import { View, StyleSheet } from "@react-pdf/renderer";
import TableRow from "./TableRow";
import { TableHeader } from "./TableHeader";
import { ReportStats } from "../../types/types";

// https://stackoverflow.com/questions/56373850/how-can-i-create-a-table-using-the-react-pdf-library-for-generation-pdf-report
// https://kags.me.ke/post/generate-dynamic-pdf-incoice-using-react-pdf/

const styles = StyleSheet.create({
  tableContainer: {
    marginTop: 10,
    marginLeft: 10,
    flexDirection: "row",
    flexWrap: "wrap",
  },
});

type Props = {
  items: ReportStats[]
}

export const PdfTable = ({ items }: Props) => (
  <View style={styles.tableContainer}>
    <TableHeader />
    <TableRow items={items} />
    {/*<TableFooter items={data.items} />*/}
  </View>
);