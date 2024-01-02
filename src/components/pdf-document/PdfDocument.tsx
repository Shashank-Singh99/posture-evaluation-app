import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Svg,
  Line,
} from "@react-pdf/renderer";
import { ReportStats } from "../../types/types";
import { PdfTable } from "./PdfTable";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    paddingTop: 30,
    paddingLeft: 30,
    paddingRight: 60,
    lineHeight: 1.5,
    flexDirection: "column",
  },
  line: {
    marginTop: 10,
    marginBottom: 10,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  image: {
    width: 300,
    height: 50,
  },
  mainImage: {
    marginTop: 10,
    width: 500,
    height: 300,
  },
});

type Props = {
  mainImgSrc: string;
  data: ReportStats[];
};

const HeaderText = ({ ...props }) => {
  return (
    <Text>
      <Text style={{ fontFamily: "Helvetica-Bold" }}>{props.label}</Text>
      {props.value}
    </Text>
  );
};

const PdfDocument = ({ ...props }: Props) => (
  <Document title="PhysioTrack Anterior Posture Evaluation">
    <Page size="A4" style={styles.page}>
      <Image style={styles.image} src="logo-without-bg.png" />
      <View>
        <Svg height="10" width="500">
          <Line
            x1="0"
            y1="5"
            x2="500"
            y2="5"
            strokeWidth={2}
            stroke="rgb(211, 211, 211)"
          />
        </Svg>
        <View style={{ display: "flex", flexDirection: "row" }}>
          <View>
            <HeaderText label="Patient Name: " value="Sharad Kumar" />
            <HeaderText label="Patient Age: " value="53 years" />
            <HeaderText
              label="Patient Address: "
              value="123, Boulevard, India"
            />
          </View>
          <View style={{ marginLeft: 30 }}>
            <HeaderText label="Treatment Package: " value="Posture Assesment" />
            <HeaderText label="Package Tier: " value="Gold" />
            <HeaderText label="Assesment Type: " value="Anterior Posture" />
          </View>
        </View>

        <Svg height="10" width="500">
          <Line
            x1="0"
            y1="5"
            x2="500"
            y2="5"
            strokeWidth={2}
            stroke="rgb(211, 211, 211)"
          />
        </Svg>
      </View>

      <View>
        <Text style={{ fontFamily: "Helvetica" }}>
          {" "}
          We have detected probability of misalignments in your anterior
          posture. Please consider taking deeper posture assesments and further
          consultation with your specialist.
        </Text>
      </View>

      <View style={{ display: "flex", flexDirection: "row" }}>
        <Image src={props.mainImgSrc} style={styles.mainImage}></Image>
        <PdfTable items={props.data} />
      </View>
    </Page>
  </Document>
);

export default PdfDocument;
